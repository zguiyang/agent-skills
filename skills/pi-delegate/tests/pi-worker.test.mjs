import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EventEmitter } from 'node:events';
import { tmpdir } from 'node:os';
import { PassThrough, Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import {
  buildArgs,
  createEventParser,
  buildPrompt,
  buildWorkspacePolicy,
  makeProgressHandler,
  readRequestFromStdin,
  runRequest,
  spawnOnce,
  validateRequest,
} from '../scripts/pi-worker.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/events.jsonl', import.meta.url));
const cwd = path.resolve(path.dirname(fixturePath), '../..');

function validRequest(overrides = {}) {
  return {
    action: 'delegate',
    taskId: 'task-fixture',
    cwd,
    provider: 'deepseek',
    model: 'deepseek-flash',
    thinking: 'low',
    profile: 'implementation',
    workspaceMode: 'existing',
    prompt: 'Inspect `src/$name`\n中文\n"quoted"',
    ...overrides,
  };
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
    child.stdout.write('{"type":"agent_start"}\n{"type":"agent_end","messages":[{"role":"assistant","content":[{"type":"text","text":"received"}]}]}\n');
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
  const existing = buildWorkspacePolicy(validRequest({ workspaceMode: 'existing' }));
  assert.match(existing, /Work only in the supplied cwd/);
  assert.match(existing, /Do not create or switch worktrees/);
  const delegated = buildWorkspacePolicy(validRequest({ workspaceMode: 'delegated' }));
  assert.match(delegated, /inspect relevant project Skills/);
  assert.match(delegated, /stop and return \[NEEDS_DECISION\]/);
  const continuing = buildWorkspacePolicy(validRequest({ action: 'continue', workspaceMode: 'delegated', cwd: '/repo/.worktrees/task-fixture' }));
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
    assert.equal(options.stdio[0], 'pipe');
    assert.equal(args.includes(validRequest().prompt), false);
    assert.match(call.promptText, /Task:\nInspect/);
    child.stdout.write('{"type":"agent_start"}\n{"type":"agent_end","messages":[{"role":"assistant","content":[{"type":"text","text":"ok"}]}]}\n');
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

test('stdin fallback to argv happens only after an explicit pre-execution prompt failure', async () => {
  const calls = fakeSpawn(({ child, args, options, index, call }) => {
    if (index === 0) {
      assert.equal(options.stdio[0], 'pipe');
      child.stderr.write('No message provided');
      closeChild(child, 1);
    } else {
      assert.equal(options.stdio[0], 'ignore');
      assert.equal(args.at(-1), buildPrompt(validRequest()));
      child.stdout.write('{"type":"agent_start"}\n{"type":"agent_end","messages":[{"role":"assistant","content":[{"type":"text","text":"ok"}]}]}\n');
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
  assert.deepEqual(calls.calls.map((call) => call.args[0]), ['--provider', '--help', '--provider']);
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
    const events = [
      { type: 'agent_start' },
      { type: 'agent_end', messages: [{ role: 'assistant', content: [{ type: 'text', text: '[NEEDS_DECISION] Need a workspace decision.' }] }] },
    ];
    child.stdout.write(events.map((event) => JSON.stringify(event)).join('\n') + '\n');
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
