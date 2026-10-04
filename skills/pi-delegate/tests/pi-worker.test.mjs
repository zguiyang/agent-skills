import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { tmpdir } from 'node:os';
import { PassThrough, Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import {
  assessAtomicTask,
  buildArgs,
  buildPrompt,
  buildTaskReportFields,
  buildWorkspacePolicy,
  createEventParser,
  extractSessionMetadata,
  getDelegatedSessionDir,
  looksVague,
  makeProgressHandler,
  parseTaskReport,
  readRequestFromStdin,
  readSessionMetadata,
  resolveModel,
  resolveWindowsNpmShim,
  runRequest,
  spawnOnce,
  validateRequest,
} from '../scripts/pi-worker.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/events.jsonl', import.meta.url));
const flashSessionFile = fileURLToPath(new URL('./fixtures/session-flash.jsonl', import.meta.url));
const proSessionFile = fileURLToPath(new URL('./fixtures/session-pro.jsonl', import.meta.url));
const unknownSessionFile = fileURLToPath(new URL('./fixtures/session-unknown.jsonl', import.meta.url));
const cwd = path.resolve(path.dirname(fixturePath), '../..');
const REPORT_START = '---PI_TASK_REPORT---';
const REPORT_END = '---END_PI_TASK_REPORT---';

function validRequest(overrides = {}) {
  const request = {
    action: 'delegate',
    taskId: 'task-fixture',
    cwd,
    provider: 'deepseek',
    model: 'deepseek-flash',
    thinking: 'low',
    profile: 'implementation',
    workspaceMode: 'existing',
    objective: 'Inspect `src/$name` and report the token refresh findings.',
    scope: ['src'],
    constraints: [],
    acceptance: ['Report file and line evidence'],
    prompt: 'Inspect `src/$name`\n中文\n"quoted"',
    ...overrides,
  };
  if (!Object.hasOwn(overrides, 'writeMode')) {
    if (request.workspaceMode === 'delegated' || request.profile === 'readonly') {
      delete request.writeMode;
    } else {
      request.writeMode = 'isolated';
      request.allowedWriteScope = ['src'];
    }
  }
  return request;
}

function fakeSpawn(onCall) {
  const calls = [];
  const spawnImpl = (executable, args, options) => {
    const child = new EventEmitter();
    child.stdin = new PassThrough();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    const call = { executable, args, options, child, promptText: '' };
    child.stdin.on('data', (chunk) => { call.promptText += chunk.toString('utf8'); });
    calls.push(call);
    child.kill = () => true;
    setImmediate(() => onCall({ child, executable, args, options, index: calls.length - 1, call }));
    return child;
  };
  return { calls, spawnImpl };
}

function closeChild(child, code = 0) {
  child.stdout.end();
  child.stderr.end();
  child.emit('close', code, null);
}

function completeText(text) {
  return `${JSON.stringify({ type: 'agent_start' })}\n${JSON.stringify({ type: 'agent_end', messages: [{ role: 'assistant', content: [{ type: 'text', text }] }] })}\n`;
}

function structuredReport(overrides = {}) {
  return {
    summary: 'Changed the guard.',
    changedFiles: ['src/auth.ts'],
    validation: ['node --test passed'],
    remainingIssue: null,
    decisionNeeded: null,
    writeScope: ['src/auth'],
    scopeExceeded: false,
    outOfScopeFindings: ['src/legacy.ts still uses the old helper'],
    ...overrides,
  };
}

test('validates request and maps continue to the same session id', () => {
  const request = validateRequest(validRequest({ action: 'continue' }));
  assert.equal(request.sessionId, 'task-fixture');
  const args = buildArgs(request);
  assert.equal(args[args.indexOf('--session-id') + 1], 'task-fixture');
  assert.equal(args.includes(buildPrompt(request)), false);
  assert.equal(args.at(-1), '--print');
  assert.throws(() => validateRequest(validRequest({ action: 'continue', workspaceMode: 'delegated' })), /sessionFile/);
});

test('profiles distinguish hard read-only from verification shell access', () => {
  const readonlyArgs = buildArgs(validRequest({ profile: 'readonly' }));
  assert.deepEqual(readonlyArgs.slice(readonlyArgs.indexOf('--tools') + 1, readonlyArgs.indexOf('--tools') + 2), ['read,grep,find,ls']);
  const verificationArgs = buildArgs(validRequest({ profile: 'verification' }));
  assert.equal(verificationArgs[verificationArgs.indexOf('--tools') + 1], 'read,grep,find,ls,bash');
});

test('JSONL framing preserves split UTF-8 and treats Unicode line separators as data', () => {
  const events = [];
  const parser = createEventParser((event) => events.push(event));
  const bytes = Buffer.from('{"text":"中文\\u2028next"}\n{"type":"text","value":"`$x`"}\n');
  for (let index = 0; index < bytes.length; index += 1) parser.push(bytes.subarray(index, index + 1));
  parser.end();
  assert.equal(parser.malformedLines, 0);
  assert.equal(events[0].text, '中文\u2028next');
  assert.equal(events[1].value, '`$x`');
});

test('handles assistant deltas, tool execution, final text, and available usage', async () => {
  const state = { eventsSeen: 0, executionStarted: false, agentEnded: false, textDeltas: '', finalText: '', usage: null };
  const fixture = await readFile(fixturePath, 'utf8');
  const parser = createEventParser(makeProgressHandler(state));
  parser.push(Buffer.from(fixture));
  parser.end();
  assert.equal(state.executionStarted, true);
  assert.equal(state.agentEnded, true);
  assert.match(state.textDeltas, /准备修改 `src\/a\.ts`/);
  assert.equal(state.finalText, '完成。');
  assert.deepEqual(state.usage, { input: 12, output: 7, cacheRead: 3, cacheWrite: 1, cost: 0.004 });
});

test('malformed JSONL records are counted instead of crashing the stream parser', () => {
  const parser = createEventParser(() => {});
  parser.push(Buffer.from('{bad json}\n'));
  parser.end();
  assert.equal(parser.malformedLines, 1);
});

test('stdin is the preferred prompt transport and keeps long multilingual prompts out of argv', async () => {
  const mark = String.fromCharCode(96);
  const longPrompt = (`中文 ${mark}code${mark} $HOME "double" 'single'\n; && |\n`).repeat(12000);
  const request = validRequest({ prompt: longPrompt });
  const prompt = buildPrompt(request);
  const calls = fakeSpawn(({ child, args, options, call }) => {
    assert.equal(options.shell, false);
    assert.equal(options.stdio[0], 'pipe');
    assert.equal(args.includes(prompt), false);
    assert.equal(call.promptText, prompt);
    assert.match(call.promptText, /---PI_TASK_REPORT---/);
    child.stdout.write(completeText('received'));
    closeChild(child, 0);
  });
  const result = await runRequest(request, { spawnImpl: calls.spawnImpl });
  assert.equal(result.promptTransport, 'stdin');
  assert.equal(result.fallbackUsed, false);
  assert.equal(calls.calls.length, 1);
});

test('argv fallback keeps shell metacharacters literal and cannot execute shell syntax', async () => {
  const marker = path.join(tmpdir(), `pi-delegate-shell-${process.pid}`);
  const prompt = `backtick \u0060touch ${marker}\u0060; $HOME; "double" 'single'\n中文`;
  const request = validRequest({ prompt });
  const fullPrompt = buildPrompt(request);
  const args = buildArgs(request, true, 'argv');
  assert.equal(args.at(-1), fullPrompt);
  const script = 'process.stdout.write(JSON.stringify(process.argv.slice(1)))';
  const result = await spawnOnce(process.execPath, ['-e', script, '--', fullPrompt], { cwd, promptTransport: 'argv' });
  assert.equal(result.exitCode, 0);
  assert.equal(JSON.parse(result.stdout)[0], fullPrompt);
  assert.equal(buildArgs(request).includes(fullPrompt), false);
  await assert.rejects(readFile(marker));
});

test('project workspace modes keep existing paths and delegate worktree choice to Pi policy', () => {
  const existing = buildWorkspacePolicy(validRequest({ workspaceMode: 'existing', writeMode: undefined }));
  assert.match(existing, /Work only in the supplied cwd/);
  assert.match(existing, /Do not create or switch worktrees/);
  const delegated = buildWorkspacePolicy(validRequest({ workspaceMode: 'delegated', writeMode: undefined }));
  assert.match(delegated, /inspect relevant project Skills/);
  assert.match(delegated, /stop and return \[NEEDS_DECISION\]/);
  const continuing = buildWorkspacePolicy(validRequest({ action: 'continue', workspaceMode: 'delegated', writeMode: undefined, cwd: '/repo/.worktrees/task-fixture' }));
  assert.match(continuing, /Continue in this exact workspace/);
  assert.match(continuing, /do not create or select another worktree/);
  assert.equal(buildArgs(validRequest({ workspaceMode: 'delegated' })).includes('/repo/.worktrees/task-fixture'), false);
  const delegatedArgs = buildArgs(validRequest({ workspaceMode: 'delegated', sessionId: 'stable-session' }));
  assert.ok(delegatedArgs.includes('--session-dir'));
  assert.match(delegatedArgs[delegatedArgs.indexOf('--session-dir') + 1], /pi-delegate/);
  const continuedArgs = buildArgs(validRequest({ action: 'continue', workspaceMode: 'delegated', sessionId: 'stable-session', sessionFile: '/tmp/session.jsonl' }));
  assert.equal(continuedArgs[continuedArgs.indexOf('--session') + 1], '/tmp/session.jsonl');
  assert.equal(continuedArgs.includes('--session-id'), false);
});

test('V2 write policies forbid worktree creation and bound the write scope', () => {
  const direct = buildWorkspacePolicy(validRequest({ writeMode: 'direct', allowedWriteScope: ['src/auth'], workspaceStateKnown: true, writeAuthorization: true }));
  assert.match(direct, /direct write/);
  assert.match(direct, /src\/auth/);
  assert.match(direct, /do not reset, stash, clean/);
  assert.match(direct, /out-of-scope finding/);
  assert.match(direct, /serializes overlapping writes/);
  const isolated = buildWorkspacePolicy(validRequest({ writeMode: 'isolated', allowedWriteScope: ['src'] }));
  assert.match(isolated, /isolated write/);
  assert.match(isolated, /owns its lifecycle/);
  assert.match(isolated, /Report any out-of-scope finding/);
  assert.match(isolated, /disjoint worktrees/);
});

test('the task prompt honors Pi native model selection and forbids Worker model switching', () => {
  const nativePrompt = buildPrompt(validRequest({ provider: undefined, model: undefined }));
  assert.match(nativePrompt, /default model selected in the user’s native Pi configuration/);
  assert.match(nativePrompt, /Do not select a different model, upgrade/);
  assert.match(nativePrompt, /current_model, suggested_model, and why_upgrade_is_needed/);
  const explicitProPrompt = buildPrompt(validRequest({ model: 'deepseek-v4-pro' }));
  assert.match(explicitProPrompt, /explicitly selected provider\/model deepseek\/deepseek-v4-pro/);
});

test('runner request accepts a complete JSON object without waiting for EOF', async () => {
  const request = validRequest({ prompt: 'line one\n中文 `$`' });
  const bytes = Buffer.from(JSON.stringify(request));
  const stream = Readable.from(Array.from(bytes, (_, index) => bytes.subarray(index, index + 1)));
  assert.deepEqual(await readRequestFromStdin(stream), request);
});

test('non-zero child exit is observable and does not become success', async () => {
  const child = fakeSpawn(({ child }) => {
    child.stderr.write('provider failed');
    closeChild(child, 7);
  });
  const result = await spawnOnce('fake-pi', ['--mode', 'json'], { cwd, spawnImpl: child.spawnImpl });
  assert.equal(result.exitCode, 7);
  assert.match(result.stderr, /provider failed/);
});

test('Pi launch uses stdin with shell:false and does not run routine discovery', async () => {
  const calls = fakeSpawn(({ child, args, options, call }) => {
    assert.equal(options.shell, false);
    assert.equal(options.env, process.env);
    assert.equal(options.stdio[0], 'pipe');
    assert.equal(args.includes(validRequest().prompt), false);
    assert.match(call.promptText, /Task:\nInspect/);
    child.stdout.write(completeText('ok'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.cwd, cwd);
  assert.equal(result.workspaceMode, 'existing');
  assert.equal(result.requiresHumanAction, false);
  assert.equal(result.finalText, 'ok');
  assert.equal(calls.calls.length, 1);
  assert.equal(calls.calls[0].options.shell, false);
});

test('a pre-start permission denial reports the blocked path and host retry route without replay', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stderr.write("Error: EPERM: operation not permitted, mkdir '/Users/example/.pi/agent/sessions/task'\n");
    closeChild(child, 1);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.error.code, 'SANDBOX_PERMISSION');
  assert.equal(result.error.permissionDeniedPath, '/Users/example/.pi/agent/sessions/task');
  assert.equal(result.error.taskStarted, false);
  assert.match(result.error.hostAction, /host Agent permission mechanism/);
  assert.equal(result.taskStarted, false);
  assert.equal(calls.calls.length, 1);
});

test('a permission error after a task-start event is not marked safe to replay', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write(`${JSON.stringify({ type: 'agent_start' })}\n`);
    child.stderr.write("Error: EPERM: operation not permitted, open '/repo/src/file.ts'\n");
    closeChild(child, 1);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'SANDBOX_PERMISSION');
  assert.equal(result.error.taskStarted, true);
  assert.match(result.error.hostAction, /Do not replay automatically/);
  assert.equal(result.taskStarted, true);
  assert.equal(calls.calls.length, 1);
});

test('stdin fallback to argv happens only after an explicit pre-execution prompt failure', async () => {
  const calls = fakeSpawn(({ child, args, options, index }) => {
    if (index === 0) {
      assert.equal(options.stdio[0], 'pipe');
      child.stderr.write('No message provided');
      closeChild(child, 1);
    } else {
      assert.equal(options.stdio[0], 'ignore');
      assert.equal(args.at(-1), buildPrompt(validRequest()));
      child.stdout.write(completeText('ok'));
      closeChild(child, 0);
    }
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.promptTransport, 'argv');
  assert.equal(result.fallbackUsed, true);
  assert.equal(calls.calls.length, 2);
});

test('stream mode rejection runs help and one non-streaming retry', async () => {
  const calls = fakeSpawn(({ child, args, index }) => {
    if (index === 0) {
      child.stderr.write('Unknown option --mode');
      closeChild(child, 2);
    } else if (args[0] === '--help') {
      child.stdout.write('Pi help');
      closeChild(child, 0);
    } else {
      child.stdout.write('final text');
      closeChild(child, 0);
    }
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.streaming, false);
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.finalText, 'final text');
  assert.equal(result.taskStarted, true);
  assert.deepEqual(calls.calls.map((call) => call.args[0]), ['--provider', '--help', '--provider']);
});

test('permission denial in text fallback is surfaced without claiming a safe retry', async () => {
  const calls = fakeSpawn(({ child, args, index }) => {
    if (index === 0) {
      child.stderr.write('Unknown option --mode');
      closeChild(child, 2);
    } else if (args[0] === '--help') {
      child.stdout.write('Pi help');
      closeChild(child, 0);
    } else {
      child.stderr.write("Error: EPERM: operation not permitted, mkdir '/Users/example/.pi/agent/sessions/task'\n");
      closeChild(child, 1);
    }
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.error.code, 'SANDBOX_PERMISSION');
  assert.equal(result.taskStarted, null);
  assert.equal(result.error.taskStarted, null);
  assert.match(result.error.hostAction, /cannot prove whether task execution began/);
  assert.equal(calls.calls.length, 3);
});

test('unknown model triggers only provider-scoped model discovery', async () => {
  const calls = fakeSpawn(({ child, index }) => {
    if (index === 0) {
      child.stderr.write('Unknown model deepseek-flash');
      closeChild(child, 1);
    } else {
      child.stdout.write('deepseek/model-a');
      closeChild(child, 0);
    }
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.error.code, 'UNKNOWN_MODEL');
  assert.deepEqual(calls.calls[1].args, ['--list-models', 'deepseek']);
});

test('unknown Pi native default does not trigger an unscoped model scan', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stderr.write('Unknown model selected from native settings');
    closeChild(child, 1);
  });
  const result = await runRequest(validRequest({ provider: undefined, model: undefined }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.error.code, 'UNKNOWN_MODEL');
  assert.equal(result.capabilityDiscoveryUsed, false);
  assert.equal(result.capabilityDiscovery[0].skipped, true);
  assert.equal(calls.calls.length, 1);
});

test('unsupported thinking option gets help but never replays the task', async () => {
  const calls = fakeSpawn(({ child, index }) => {
    if (index === 0) {
      child.stderr.write('Unknown option --thinking');
      closeChild(child, 2);
    } else {
      child.stdout.write('current options');
      closeChild(child, 0);
    }
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.error.code, 'UNSUPPORTED_OPTION');
  assert.equal(calls.calls.length, 2);
  assert.deepEqual(calls.calls[1].args, ['--help']);
});

test('missing Pi is reported without capability probes', async () => {
  const calls = fakeSpawn(({ child }) => {
    const error = new Error('not found');
    error.code = 'ENOENT';
    child.emit('error', error);
    closeChild(child, null);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.requiresHumanAction, true);
  assert.equal(result.error.code, 'PI_NOT_FOUND');
  assert.equal(calls.calls.length, 1);
});

test('started task with malformed output is never replayed', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write('{"type":"agent_start"}\n{broken}\n');
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'MALFORMED_STREAM');
  assert.equal(calls.calls.length, 1);
});

test('timeout is surfaced and does not trigger task replay', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write('{"type":"agent_start"}\n');
    child.kill = () => {
      setImmediate(() => closeChild(child, 1));
      return true;
    };
  });
  const result = await runRequest(validRequest({ timeoutMs: 5 }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'timed_out');
  assert.equal(result.error.code, 'TIMEOUT');
  assert.equal(calls.calls.length, 1);
});

test('empty final-mode output is incomplete rather than successful', async () => {
  const calls = fakeSpawn(({ child, args, index }) => {
    if (index === 0) {
      child.stderr.write('Unknown option --mode');
      closeChild(child, 2);
    } else if (args[0] === '--help') {
      child.stdout.write('Pi help');
      closeChild(child, 0);
    } else closeChild(child, 0);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'INCOMPLETE_OUTPUT');
  assert.equal(result.requiresHumanAction, true);
});

test('a NEEDS_DECISION report becomes a blocked result', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write(completeText('[NEEDS_DECISION] Need a workspace decision.'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest(), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.requiresHumanAction, true);
  assert.equal(result.error.code, 'NEEDS_DECISION');
});

test('runner stays stateless and never executes Git worktree or cleanup commands', async () => {
  const source = await readFile(new URL('../scripts/pi-worker.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /spawn\(\s*['"]git['"]/);
  assert.doesNotMatch(source, /execFile\(\s*['"]git['"]/);
  assert.doesNotMatch(source, /git\s+(?:worktree\s+(?:add|remove)|reset|stash|clean)\s+["'`]/);
});

test('absent provider/model leave selection to Pi native settings', async () => {
  const request = validRequest({ provider: undefined, model: undefined });
  const args = buildArgs(request);
  assert.equal(args.includes('--provider'), false);
  assert.equal(args.includes('--model'), false);
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write(completeText('ok'));
    closeChild(child, 0);
  });
  const result = await runRequest(request, { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.provider, null);
  assert.equal(result.model, null);
  assert.equal(result.modelSource, 'pi_default');
  assert.deepEqual(resolveModel({ provider: undefined, model: undefined }), { provider: null, model: null, source: 'pi_default' });
});

test('native-default model is reported from Pi stream metadata when available', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write([
      JSON.stringify({ type: 'agent_start' }),
      JSON.stringify({ type: 'message_end', message: { role: 'assistant', provider: 'custom-provider', model: 'model-from-pi', content: [{ type: 'text', text: 'ok' }] } }),
      JSON.stringify({ type: 'agent_end', messages: [{ role: 'assistant', provider: 'custom-provider', model: 'model-from-pi', content: [{ type: 'text', text: 'ok' }] }] }),
    ].join('\n') + '\n');
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ provider: undefined, model: undefined }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.provider, 'custom-provider');
  assert.equal(result.model, 'model-from-pi');
  assert.equal(result.modelSource, 'pi_default');
});

test('explicit Flash with higher thinking is accepted and reported', async () => {
  const calls = fakeSpawn(({ child, args }) => {
    assert.equal(args[args.indexOf('--model') + 1], 'deepseek-flash');
    assert.equal(args[args.indexOf('--thinking') + 1], 'high');
    child.stdout.write(completeText('ok'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ provider: 'deepseek', model: 'deepseek-flash', thinking: 'high' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.model, 'deepseek-flash');
  assert.equal(result.thinking, 'high');
});

test('explicit provider/model is passed through without a runner model-tier gate', async () => {
  const calls = fakeSpawn(({ child, args }) => {
    assert.equal(args[args.indexOf('--model') + 1], 'deepseek-v4-pro');
    assert.equal(args[args.indexOf('--provider') + 1], 'deepseek');
    child.stdout.write(completeText('ok'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ model: 'deepseek-v4-pro' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.model, 'deepseek-v4-pro');
  assert.equal(calls.calls.length, 1);
});

test('continuation without override uses the Pi session model and identifies it in the result', async () => {
  const calls = fakeSpawn(({ child, args }) => {
    assert.equal(args.includes('--provider'), false);
    assert.equal(args.includes('--model'), false);
    child.stdout.write(completeText('continued'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ action: 'continue', provider: undefined, model: undefined, sessionFile: proSessionFile }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.provider, 'deepseek');
  assert.equal(result.model, 'deepseek-v4-pro');
  assert.equal(result.modelSource, 'session');
  assert.equal(calls.calls.length, 1);
});

test('continuation with an explicit conflicting model is blocked before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({ action: 'continue', sessionFile: proSessionFile, provider: 'deepseek', model: 'deepseek-flash' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.decisionNeeded.type, 'needs_decision');
  assert.equal(result.decisionNeeded.reason, 'session_model_conflict');
  assert.equal(result.decisionNeeded.current_model, 'deepseek/deepseek-v4-pro');
  assert.equal(result.decisionNeeded.suggested_model, 'deepseek/deepseek-flash');
  assert.equal(calls.calls.length, 0);
});

test('continuation uses original cwd plus exact sessionFile when the session model matches', async () => {
  const calls = fakeSpawn(({ child, args, options }) => {
    assert.equal(options.cwd, cwd);
    assert.equal(args[args.indexOf('--session') + 1], flashSessionFile);
    assert.equal(args.includes('--session-id'), false);
    child.stdout.write(completeText('continued'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ action: 'continue', sessionFile: flashSessionFile }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.cwd, cwd);
  assert.equal(result.sessionFile, flashSessionFile);
  assert.equal(calls.calls.length, 1);
});

test('continuation with unreadable session metadata is blocked before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({ action: 'continue', sessionFile: unknownSessionFile }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.decisionNeeded.type, 'needs_decision');
  assert.match(result.decisionNeeded.why_upgrade_is_needed, /Could not determine/);
  assert.equal(calls.calls.length, 0);
  const metadata = await readSessionMetadata(unknownSessionFile);
  assert.equal(metadata.provider, null);
  assert.equal(metadata.model, null);
});

test('continuation without a sessionFile is blocked before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({ action: 'continue' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.match(result.decisionNeeded.reason, /sessionFile/);
  assert.equal(calls.calls.length, 0);
});

test('session metadata extraction reads provider/model and thinking from JSONL', () => {
  const metadata = extractSessionMetadata([
    '{"type":"session","id":"s1"}',
    '{"type":"model_change","provider":"deepseek","modelId":"deepseek-flash"}',
    '{"type":"thinking_level_change","thinkingLevel":"medium"}',
  ].join('\n'));
  assert.deepEqual(metadata, { sessionId: 's1', provider: 'deepseek', model: 'deepseek-flash', thinking: 'medium' });
});

test('an obviously vague/non-atomic task is rejected before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({ objective: 'fix it', prompt: undefined, scope: undefined, constraints: undefined, acceptance: undefined }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.requiresHumanAction, true);
  assert.equal(result.decisionNeeded.type, 'needs_decision');
  assert.equal(calls.calls.length, 0);
  assert.equal(looksVague('fix it'), true);
  assert.equal(looksVague('Inspect src/auth and report the token refresh findings.'), false);
});

test('a task missing scope or acceptance criteria is rejected before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const missingScope = await runRequest(validRequest({ scope: [], acceptance: ['done'] }), { spawnImpl: calls.spawnImpl });
  assert.equal(missingScope.status, 'blocked');
  assert.match(missingScope.decisionNeeded.reason, /scope/);
  const missingAcceptance = await runRequest(validRequest({ scope: ['src'], acceptance: [] }), { spawnImpl: calls.spawnImpl });
  assert.equal(missingAcceptance.status, 'blocked');
  assert.match(missingAcceptance.decisionNeeded.reason, /acceptance/);
  assert.equal(calls.calls.length, 0);
});

test('a structured atomic read task is accepted', async () => {
  const calls = fakeSpawn(({ child, args }) => {
    assert.equal(args[args.indexOf('--tools') + 1], 'read,grep,find,ls');
    child.stdout.write(completeText('read done'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ profile: 'readonly' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.hardReadOnly, true);
  assert.equal(calls.calls.length, 1);
});

test('a direct write with scope, known state, and authorization is accepted', async () => {
  const request = validRequest({
    objective: 'Implement the token refresh guard in src/auth.',
    scope: ['src/auth'],
    allowedWriteScope: ['src/auth'],
    writeMode: 'direct',
    workspaceStateKnown: true,
    writeAuthorization: true,
  });
  const calls = fakeSpawn(({ child, options, call }) => {
    assert.equal(options.shell, false);
    assert.match(call.promptText, /direct write/);
    assert.match(call.promptText, /src\/auth/);
    child.stdout.write(completeText('implemented'));
    closeChild(child, 0);
  });
  const result = await runRequest(request, { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.writeMode, 'direct');
  assert.deepEqual(result.writeScope, ['src/auth']);
  assert.equal(calls.calls.length, 1);
});

test('a direct write without allowedWriteScope is rejected before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({
    objective: 'Implement the token refresh guard in src/auth.',
    scope: ['src/auth'],
    writeMode: 'direct',
    workspaceStateKnown: true,
    writeAuthorization: true,
  }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.match(result.decisionNeeded.reason, /allowedWriteScope/);
  assert.equal(calls.calls.length, 0);
});

test('a direct write without known workspace state is rejected before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({
    objective: 'Implement the token refresh guard in src/auth.',
    scope: ['src/auth'],
    allowedWriteScope: ['src/auth'],
    writeMode: 'direct',
    writeAuthorization: true,
  }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.match(result.decisionNeeded.reason, /workspaceStateKnown/);
  assert.equal(calls.calls.length, 0);
});

test('a direct write without supervisor authorization is rejected before launch', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({
    objective: 'Implement the token refresh guard in src/auth.',
    scope: ['src/auth'],
    allowedWriteScope: ['src/auth'],
    writeMode: 'direct',
    workspaceStateKnown: true,
  }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.match(result.decisionNeeded.reason, /writeAuthorization/);
  assert.equal(calls.calls.length, 0);
});

test('an isolated write supplied by the supervisor is accepted', async () => {
  const request = validRequest({
    objective: 'Implement the token refresh guard in the isolated worktree.',
    scope: ['src/auth'],
    allowedWriteScope: ['src/auth'],
    writeMode: 'isolated',
  });
  const calls = fakeSpawn(({ child, call }) => {
    assert.match(call.promptText, /isolated write/);
    child.stdout.write(completeText('implemented'));
    closeChild(child, 0);
  });
  const result = await runRequest(request, { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.writeMode, 'isolated');
  assert.equal(calls.calls.length, 1);
});

test('writeMode is rejected with readonly profile or delegated workspaceMode', () => {
  assert.throws(() => validateRequest(validRequest({ profile: 'readonly', writeMode: 'direct' })), /writeMode cannot be combined/);
  assert.throws(() => validateRequest(validRequest({ workspaceMode: 'delegated', writeMode: 'isolated' })), /workspaceMode "delegated"/);
});

test('a structured Pi final report is parsed into runner fields', async () => {
  const report = structuredReport();
  const text = `Done.\n${REPORT_START}\n${JSON.stringify(report)}\n${REPORT_END}`;
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write(completeText(text));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ profile: 'readonly' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.reportParsed, true);
  assert.equal(result.summary, 'Changed the guard.');
  assert.deepEqual(result.changedFiles, ['src/auth.ts']);
  assert.deepEqual(result.validation, ['node --test passed']);
  assert.deepEqual(result.outOfScopeFindings, ['src/legacy.ts still uses the old helper']);
  assert.equal(result.scopeExceeded, false);
  assert.deepEqual(parseTaskReport(text), report);
});

test('a missing structured report yields explicit unknown/empty fields', async () => {
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write(completeText('I did some things but did not use the report format.'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ profile: 'readonly' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.reportParsed, false);
  assert.equal(result.summary, null);
  assert.equal(result.changedFiles, null);
  assert.equal(result.validation, null);
  assert.equal(result.remainingIssue, null);
  assert.equal(result.scopeExceeded, null);
  assert.deepEqual(result.outOfScopeFindings, []);
  assert.deepEqual(buildTaskReportFields(validRequest({ allowedWriteScope: ['src'] }), '').writeScope, ['src']);
});

test('Windows npm shims are resolved to the node entrypoint without a shell', async () => {
  const shim = 'node "%~dp0\\node_modules\\@earendil-works\\pi\\cli.js" %*';
  const resolved = await resolveWindowsNpmShim('pi', ['--print'], {
    platform: 'win32',
    env: { PATH: 'C:\\npm' },
    readFileImpl: async () => shim,
  });
  assert.equal(resolved.executable, process.execPath);
  assert.deepEqual(resolved.args, ['C:\\npm\\node_modules\\@earendil-works\\pi\\cli.js', '--print']);
  const passthrough = await resolveWindowsNpmShim('/usr/local/bin/pi', ['--print'], { platform: 'darwin' });
  assert.deepEqual(passthrough, { executable: '/usr/local/bin/pi', args: ['--print'] });
});

test('assessAtomicTask returns null for a complete atomic task', () => {
  assert.equal(assessAtomicTask(validRequest()), null);
  assert.equal(resolveModel(validRequest()).source, 'explicit');
});

test('an explicitly selected model may continue a matching Pi session', async () => {
  const calls = fakeSpawn(({ child, args }) => {
    assert.equal(args[args.indexOf('--model') + 1], 'deepseek-v4-pro');
    assert.equal(args[args.indexOf('--session') + 1], proSessionFile);
    child.stdout.write(completeText('continued'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ action: 'continue', sessionFile: proSessionFile, model: 'deepseek-v4-pro' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.model, 'deepseek-v4-pro');
  assert.equal(calls.calls.length, 1);
});

test('a V2 write objective without writeMode is blocked in existing mode', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({ objective: 'Implement the token refresh guard in src/auth.', writeMode: undefined, allowedWriteScope: undefined }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.match(result.decisionNeeded.reason, /writeMode/);
  assert.equal(calls.calls.length, 0);
});

test('V1 delegated mode still launches without writeMode for backward compatibility', async () => {
  const calls = fakeSpawn(({ child, args }) => {
    assert.ok(args.includes('--session-dir'));
    child.stdout.write(completeText('legacy delegated done'));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ objective: 'Implement the token refresh guard via the project worktree rule.', workspaceMode: 'delegated', profile: 'implementation' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.workspaceMode, 'delegated');
  assert.equal(calls.calls.length, 1);
});

test('a structured report decisionNeeded becomes a blocked result', async () => {
  const text = `${REPORT_START}\n${JSON.stringify(structuredReport({ decisionNeeded: { reason: 'Need a schema decision.' } }))}\n${REPORT_END}`;
  const calls = fakeSpawn(({ child }) => {
    child.stdout.write(completeText(text));
    closeChild(child, 0);
  });
  const result = await runRequest(validRequest({ profile: 'readonly' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.requiresHumanAction, true);
  assert.equal(result.error.code, 'NEEDS_DECISION');
  assert.deepEqual(result.decisionNeeded, { reason: 'Need a schema decision.' });
});

test('a structured write request without writeMode is blocked regardless of language', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({
    objective: '请修改 src/auth/service.ts 中的 refresh 函数并补充回归测试。',
    scope: ['src/auth/service.ts'],
    writeMode: undefined,
    allowedWriteScope: undefined,
  }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.match(result.decisionNeeded.reason, /writeMode/);
  assert.equal(calls.calls.length, 0);
});

test('obviously project-wide objectives are rejected as non-atomic', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({
    objective: '请全面重构整个项目并优化各个模块的架构。',
    writeMode: 'isolated',
    allowedWriteScope: ['.'],
  }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.decisionNeeded.type, 'needs_decision');
  assert.equal(calls.calls.length, 0);
});

test('structured new sessions use a managed session directory and return sessionFile', async () => {
  const sessionRoot = mkdtempSync(path.join(tmpdir(), 'pi-delegate-session-root-'));
  const previousRoot = process.env.PI_CODING_AGENT_SESSION_DIR;
  process.env.PI_CODING_AGENT_SESSION_DIR = sessionRoot;
  const request = validRequest({ taskId: `session-return-${process.pid}`, provider: undefined, model: undefined });
  const sessionDir = getDelegatedSessionDir(request);
  mkdirSync(sessionDir, { recursive: true });
  const sessionFile = path.join(sessionDir, `2026-10-04_${request.sessionId}.jsonl`);
  writeFileSync(sessionFile, await readFile(flashSessionFile));
  const calls = fakeSpawn(({ child, args }) => {
    assert.equal(args[args.indexOf('--session-dir') + 1], sessionDir);
    child.stdout.write(completeText('session captured'));
    closeChild(child, 0);
  });
  try {
    const result = await runRequest(request, { spawnImpl: calls.spawnImpl });
    assert.equal(result.status, 'completed');
    assert.equal(result.sessionFile, sessionFile);
    assert.equal(result.cwd, cwd);
    assert.equal(result.provider, 'deepseek');
    assert.equal(result.model, 'deepseek-flash');
    assert.equal(result.modelSource, 'pi_default');
  } finally {
    if (previousRoot === undefined) delete process.env.PI_CODING_AGENT_SESSION_DIR;
    else process.env.PI_CODING_AGENT_SESSION_DIR = previousRoot;
    rmSync(sessionRoot, { recursive: true, force: true });
  }
});

test('continuation model safety inspects the session tail for later model changes', async () => {
  const sessionRoot = mkdtempSync(path.join(tmpdir(), 'pi-delegate-session-tail-'));
  const sessionFile = path.join(sessionRoot, 'long-session.jsonl');
  const lines = [
    JSON.stringify({ type: 'session', id: 'long-session' }),
    JSON.stringify({ type: 'model_change', provider: 'deepseek', modelId: 'deepseek-flash' }),
    JSON.stringify({ type: 'other', payload: 'x'.repeat(256 * 1024 + 1024) }),
    JSON.stringify({ type: 'model_change', provider: 'deepseek', modelId: 'deepseek-v4-pro' }),
  ];
  writeFileSync(sessionFile, `${lines.join('\n')}\n`);
  try {
    const metadata = await readSessionMetadata(sessionFile);
    assert.equal(metadata.provider, 'deepseek');
    assert.equal(metadata.model, 'deepseek-v4-pro');
  } finally {
    rmSync(sessionRoot, { recursive: true, force: true });
  }
});

test('an explicit model override requires provider and model together', async () => {
  const calls = fakeSpawn(({ child }) => { closeChild(child, 1); });
  const result = await runRequest(validRequest({ provider: undefined, model: 'claude-3' }), { spawnImpl: calls.spawnImpl });
  assert.equal(result.status, 'blocked');
  assert.equal(result.provider, null);
  assert.match(result.decisionNeeded.reason, /provider and model must be supplied together/);
  assert.equal(calls.calls.length, 0);
});
