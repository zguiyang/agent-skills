#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { delimiter, dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { TextDecoder } from 'node:util';
import { pathToFileURL } from 'node:url';

const THINKING_LEVELS = new Set(['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']);
const PROFILES = new Set(['readonly', 'implementation', 'verification']);
const READ_TOOLS = 'read,grep,find,ls';
const VERIFICATION_TOOLS = 'read,grep,find,ls,bash';

function writeResult(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function redactSensitive(value) {
  return String(value)
    .replace(/\b(authorization)\s*[:=]\s*(?:bearer\s+)?[^\s,"'`]+/gi, '$1: [redacted]')
    .replace(/\b(api[_-]?key|access[_-]?token|refresh[_-]?token)\b(["'\s:=]+)([^\s,"'`]+)/gi, '$1$2[redacted]')
    .replace(/\bbearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [redacted]')
    .replace(/\b(sk-[A-Za-z0-9_-]{12,}|xox[baprs]-[A-Za-z0-9-]{12,}|gh[pousr]_[A-Za-z0-9]{20,})\b/g, '[redacted]');
}

function fail(code, message, fields = {}) {
  return { status: 'failed', requiresHumanAction: true, error: { code, message }, ...fields };
}

function validateRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Request must be a JSON object.');
  if (!['delegate', 'continue'].includes(value.action)) throw new Error('action must be "delegate" or "continue".');
  for (const key of ['taskId', 'cwd', 'prompt']) {
    if (typeof value[key] !== 'string' || value[key].trim() === '') throw new Error(`${key} must be a non-empty string.`);
  }
  if (!isAbsolutePath(value.cwd)) throw new Error('cwd must be an absolute path.');
  if (value.sessionId !== undefined && (typeof value.sessionId !== 'string' || value.sessionId.length === 0)) {
    throw new Error('sessionId must be a non-empty string when provided.');
  }
  if (value.sessionFile !== undefined && (typeof value.sessionFile !== 'string' || !isAbsolutePath(value.sessionFile))) {
    throw new Error('sessionFile must be an absolute path when provided.');
  }
  for (const key of ['provider', 'model', 'thinking']) {
    if (value[key] !== undefined && (typeof value[key] !== 'string' || value[key].trim() === '')) {
      throw new Error(`${key} must be a non-empty string when provided.`);
    }
  }
  if (value.thinking && !THINKING_LEVELS.has(value.thinking)) {
    throw new Error(`thinking must be one of: ${[...THINKING_LEVELS].join(', ')}.`);
  }
  if (value.profile !== undefined && !PROFILES.has(value.profile)) {
    throw new Error(`profile must be one of: ${[...PROFILES].join(', ')}.`);
  }
  if (value.workspaceMode !== undefined && !['existing', 'delegated'].includes(value.workspaceMode)) {
    throw new Error('workspaceMode must be "existing" or "delegated".');
  }
  if (value.action === 'continue' && value.workspaceMode === 'delegated' && !value.sessionFile) {
    throw new Error('sessionFile from the prior delegated result is required to continue the same Pi session across cwd changes.');
  }
  if (value.acceptance !== undefined && (!Array.isArray(value.acceptance) || value.acceptance.some((item) => typeof item !== 'string'))) {
    throw new Error('acceptance must be an array of strings.');
  }
  if (value.timeoutMs !== undefined && (!Number.isFinite(value.timeoutMs) || value.timeoutMs <= 0)) {
    throw new Error('timeoutMs must be a positive finite number.');
  }
  return {
    ...value,
    sessionId: value.sessionId ?? value.taskId,
    profile: value.profile ?? 'implementation',
    workspaceMode: value.workspaceMode ?? 'existing',
  };
}

function isAbsolutePath(value) {
  return isAbsolute(value);
}

function getDelegatedSessionDir(request) {
  const configuredRoot = process.env.PI_CODING_AGENT_SESSION_DIR
    ?? join(process.env.PI_CODING_AGENT_DIR ?? join(homedir(), '.pi', 'agent'), 'sessions');
  const sessionKey = Buffer.from(request.sessionId ?? request.taskId, 'utf8').toString('base64url');
  return join(resolve(configuredRoot), 'pi-delegate', sessionKey);
}

async function findSessionFile(sessionDir, sessionId) {
  try {
    const files = (await readdir(sessionDir)).filter((name) => name.endsWith('.jsonl'));
    const suffix = `_${sessionId}.jsonl`;
    const matches = files.filter((name) => name.endsWith(suffix));
    if (matches.length === 1) return join(sessionDir, matches[0]);
    if (files.length === 1) return join(sessionDir, files[0]);
  } catch {
    // Pi may fail before creating a session file.
  }
  return null;
}

function buildPrompt(request) {
  const acceptance = request.acceptance?.length
    ? `\n\nAcceptance criteria:\n${request.acceptance.map((item) => `- ${item}`).join('\n')}`
    : '';
  return `${buildWorkspacePolicy(request)}\n\nTask:\n${request.prompt}${acceptance}`;
}

function buildWorkspacePolicy(request) {
  if (request.workspaceMode === 'existing') {
    return `Workspace mode: existing. Work only in the supplied cwd (${request.cwd}). Do not create or switch worktrees or checkouts. Do not alter any other workspace.`;
  }
  if (request.action === 'continue') {
    return `Workspace mode: delegated continuation. The supplied cwd (${request.cwd}) must be the actual worktree path reported by the prior turn. Continue in this exact workspace and existing session; do not create or select another worktree. If the prior workspace path was not supplied, stop and return [NEEDS_DECISION].`;
  }
  if (request.profile === 'readonly') {
    return `Workspace mode: delegated. This task is read-only; do not create a worktree or modify files. Inspect only the supplied repository root (${request.cwd}).`;
  }
  return `Workspace mode: delegated. The supplied cwd (${request.cwd}) is the target repository root. Before any write, read its AGENTS.md and inspect relevant project Skills/rules for worktree management. If a project worktree Skill/rule exists, follow it to create an isolated worktree and perform every write and test there. If no such safe rule exists, or worktree creation fails, stop and return [NEEDS_DECISION]; do not edit this checkout or invent a fallback. Report the exact worktree path in the final response. Do not reset, stash, clean, overwrite branches, commit, push, or merge.`;
}

function buildArgs(request, streaming = true, promptTransport = 'stdin') {
  const args = [];
  if (request.provider) args.push('--provider', request.provider);
  if (request.model) args.push('--model', request.model);
  if (request.thinking) args.push('--thinking', request.thinking);
  if (request.workspaceMode === 'delegated') args.push('--session-dir', getDelegatedSessionDir(request));
  if (request.sessionFile) args.push('--session', request.sessionFile);
  else args.push('--session-id', request.sessionId);
  if (request.profile === 'readonly') args.push('--tools', READ_TOOLS);
  if (request.profile === 'verification') args.push('--tools', VERIFICATION_TOOLS);
  if (streaming) args.push('--mode', 'json');
  args.push('--print');
  if (promptTransport === 'argv') args.push('--', buildPrompt(request));
  return args;
}

function createEventParser(onEvent) {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let remainder = '';
  let malformedLines = 0;
  function consume(text, final = false) {
    remainder += text;
    const records = remainder.split('\n');
    remainder = records.pop() ?? '';
    for (const record of records) parseLine(record);
    if (final && remainder.length > 0) {
      parseLine(remainder);
      remainder = '';
    }
  }
  function parseLine(line) {
    const trimmed = line.endsWith('\r') ? line.slice(0, -1) : line;
    if (!trimmed.trim()) return;
    try {
      onEvent(JSON.parse(trimmed));
    } catch {
      malformedLines += 1;
      process.stderr.write('[PI] malformed JSON event line\n');
    }
  }
  return {
    push(chunk) { consume(decoder.decode(chunk, { stream: true })); },
    end() { consume(decoder.decode(), true); },
    get malformedLines() { return malformedLines; },
  };
}

function textFromContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((part) => part?.type === 'text' && typeof part.text === 'string').map((part) => part.text).join('');
}

function numericOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function normalizeUsage(usage = {}) {
  return {
    input: numericOrNull(usage.input),
    output: numericOrNull(usage.output),
    cacheRead: numericOrNull(usage.cacheRead),
    cacheWrite: numericOrNull(usage.cacheWrite),
    cost: numericOrNull(usage.cost?.total ?? usage.cost),
  };
}

function makeProgressHandler(state) {
  return (event) => {
    if (!event || typeof event !== 'object') return;
    state.eventsSeen += 1;
    if (['agent_start', 'message_start', 'message_update', 'message_end', 'tool_execution_start', 'tool_execution_end', 'agent_end', 'retry', 'compaction_start', 'auto_compaction_start'].includes(event.type)) state.executionStarted = true;
    if (event.type === 'message_update') {
      const update = event.assistantMessageEvent;
      if (update?.type === 'text_delta' && typeof update.delta === 'string') state.textDeltas += update.delta;
      if (update?.type === 'toolcall_delta' && typeof update.delta?.name === 'string') process.stderr.write(`[tool] ${update.delta.name} starting\n`);
    } else if (event.type === 'tool_execution_start') {
      const tool = event.toolName ?? 'tool';
      process.stderr.write(`[tool] ${tool}\n`);
    } else if (event.type === 'tool_execution_end') {
      process.stderr.write(event.isError ? '[tool] failed\n' : '[done]\n');
    } else if (event.type === 'message_end') {
      const message = event.message;
      if (message?.role === 'assistant') {
        const text = textFromContent(message.content);
        if (text) state.finalText = text;
        if (message.usage) state.usage = normalizeUsage(message.usage);
      }
    } else if (event.type === 'agent_end') {
      state.agentEnded = true;
      if (Array.isArray(event.messages)) {
        for (let index = event.messages.length - 1; index >= 0; index -= 1) {
          const message = event.messages[index];
          if (message?.role === 'assistant') {
            const text = textFromContent(message.content);
            if (text) state.finalText = text;
            if (message.usage) state.usage = normalizeUsage(message.usage);
            break;
          }
        }
      }
      process.stderr.write('[PI] agent settled\n');
    } else if (event.type === 'retry') {
      process.stderr.write('[PI] retrying request\n');
    } else if (event.type === 'auto_compaction_start' || event.type === 'compaction_start') {
      process.stderr.write('[PI] compacting context\n');
    } else if (event.type === 'auto_compaction_end' || event.type === 'compaction_end') {
      process.stderr.write('[PI] compaction complete\n');
    }
  };
}

async function resolveWindowsNpmShim(executable, args) {
  if (process.platform !== 'win32') return { executable, args };
  const candidates = [];
  if (extname(executable)) candidates.push(executable);
  else for (const directory of (process.env.PATH ?? '').split(delimiter)) candidates.push(join(directory, `${executable}.cmd`));
  for (const candidate of candidates) {
    let content;
    try { content = await readFile(candidate, 'utf8'); } catch { continue; }
    const match = content.match(/["']?((?:%~dp0|%dp0%)[^"'\r\n]*?\.js)["']?\s+%\*/i)
      ?? content.match(/["']([^"'\r\n]*?\.js)["']\s+%\*/i);
    if (!match) continue;
    const shimDirectory = dirname(resolve(candidate));
    const entry = match[1].replace(/^%~dp0/i, `${shimDirectory}\\`).replace(/^%dp0%/i, `${shimDirectory}\\`);
    return { executable: process.execPath, args: [entry, ...args] };
  }
  return { executable, args };
}

async function spawnOnce(executable, args, options = {}) {
  const command = await resolveWindowsNpmShim(executable, args);
  return new Promise((resolve) => {
    const child = (options.spawnImpl ?? spawn)(command.executable, command.args, {
      cwd: options.cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
      stdio: [options.promptTransport === 'stdin' ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const state = { eventsSeen: 0, executionStarted: false, agentEnded: false, textDeltas: '', finalText: '', usage: normalizeUsage() };
    const parser = options.streaming ? createEventParser(makeProgressHandler(state)) : null;
    let spawnError;
    let stdinError;
    let timedOut = false;
    let timer;
    child.stdout.on('data', (chunk) => {
      if (parser) parser.push(chunk);
      else stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString('utf8');
      stderr += text;
      if (!/Invalid settings file .*\.lock/.test(text)) process.stderr.write(redactSensitive(text));
    });
    child.once('error', (error) => { spawnError = error; });
    if (options.promptTransport === 'stdin') {
      child.stdin.on('error', (error) => { stdinError = error; });
      child.stdin.end(options.prompt ?? '');
    }
    if (options.timeoutMs) {
      timer = setTimeout(() => {
        timedOut = true;
        child.kill();
      }, options.timeoutMs);
    }
    child.once('close', (exitCode, signal) => {
      if (timer) clearTimeout(timer);
      parser?.end();
      resolve({
        exitCode,
        signal,
        spawnError,
        stdinError,
        timedOut,
        stdout,
        stderr,
        state,
        malformedLines: parser?.malformedLines ?? 0,
      });
    });
  });
}

function classifyFailure(result, args) {
  const text = `${result.stderr}\n${result.stdout}`;
  if (result.spawnError?.code === 'ENOENT') return 'PI_NOT_FOUND';
  if (/unknown model|model not found|no model matching/i.test(text)) return 'UNKNOWN_MODEL';
  if (/no (initial )?(message|prompt)( was)? (provided|specified|received)|stdin.{0,32}(unsupported|not supported|unavailable)/i.test(text)) return 'PROMPT_STDIN_UNSUPPORTED';
  if (/unknown option|unrecognized option|unsupported option|invalid option/i.test(text)) {
    if (args.includes('--mode') && /--mode|mode.{0,24}(json|output)/i.test(text)) return 'STREAM_UNSUPPORTED';
    if (args.some((argument) => ['--session', '--session-id', '--session-dir'].includes(argument)) && /--session|session/i.test(text)) return 'SESSION_UNSUPPORTED';
    return 'UNSUPPORTED_OPTION';
  }
  if (/authentication|unauthorized|invalid api key|missing api key/i.test(text)) return 'AUTH_ERROR';
  if (/rate.?limit|too many requests|429/i.test(text)) return 'RATE_LIMIT';
  if (result.timedOut) return 'TIMEOUT';
  return 'PI_FAILED';
}

async function discover(executable, kind, request, spawnImpl) {
  const args = kind === 'UNKNOWN_MODEL' ? ['--list-models', request.provider ?? ''] : ['--help'];
  const filteredArgs = args.filter((part) => part !== '');
  const result = await spawnOnce(executable, filteredArgs, { cwd: request.cwd, spawnImpl });
  return { kind, exitCode: result.exitCode, output: redactSensitive(`${result.stdout}${result.stderr}`).slice(0, 12000) };
}

async function runRequest(rawRequest, options = {}) {
  let request;
  try {
    request = validateRequest(rawRequest);
    const info = await stat(request.cwd);
    if (!info.isDirectory()) throw new Error('cwd must point to an existing directory.');
  } catch (error) {
    return fail('INVALID_REQUEST', error.message);
  }

  const executable = process.env.PI_EXECUTABLE || 'pi';
  const startTime = Date.now();
  const readonly = request.profile === 'readonly';
  const sessionDir = request.workspaceMode === 'delegated' ? getDelegatedSessionDir(request) : null;
  if (request.sessionFile) {
    try {
      const info = await stat(request.sessionFile);
      if (!info.isFile()) throw new Error('sessionFile must point to a file.');
    } catch (error) {
      return fail('INVALID_REQUEST', `sessionFile is unavailable: ${error.message}`);
    }
  }
  const base = {
    action: request.action,
    taskId: request.taskId,
    sessionId: request.sessionId,
    cwd: request.cwd,
    workspaceMode: request.workspaceMode,
    sessionFile: request.sessionFile ?? null,
    provider: request.provider ?? null,
    model: request.model ?? null,
    thinking: request.thinking ?? null,
    streaming: true,
    fallbackUsed: false,
    promptTransport: 'stdin',
    hardReadOnly: false,
    capabilityDiscovery: [],
    capabilityDiscoveryUsed: false,
  };
  let promptTransport = 'stdin';
  let args = buildArgs(request, true, promptTransport);
  let result = await spawnOnce(executable, args, {
    cwd: request.cwd, streaming: true, timeoutMs: request.timeoutMs, spawnImpl: options.spawnImpl,
    promptTransport, prompt: buildPrompt(request),
  });

  const promptNotAcceptedBeforeStart = !result.state.executionStarted && !result.spawnError
    && classifyFailure(result, args) === 'PROMPT_STDIN_UNSUPPORTED';
  if (promptNotAcceptedBeforeStart) {
    promptTransport = 'argv';
    base.promptTransport = promptTransport;
    base.fallbackUsed = true;
    args = buildArgs(request, true, promptTransport);
    result = await spawnOnce(executable, args, {
      cwd: request.cwd, streaming: true, timeoutMs: request.timeoutMs, spawnImpl: options.spawnImpl,
      promptTransport, prompt: buildPrompt(request),
    });
  }

  const modeRejectedBeforeStart = result.exitCode !== 0 && !result.state.executionStarted && !result.spawnError
    && classifyFailure(result, args) === 'STREAM_UNSUPPORTED';
  if (modeRejectedBeforeStart) {
    base.capabilityDiscovery.push(await discover(executable, 'UNSUPPORTED_OPTION', request, options.spawnImpl));
    base.capabilityDiscoveryUsed = true;
    const fallbackArgs = buildArgs(request, false, promptTransport);
    result = await spawnOnce(executable, fallbackArgs, {
      cwd: request.cwd, timeoutMs: request.timeoutMs, spawnImpl: options.spawnImpl,
      promptTransport, prompt: buildPrompt(request),
    });
    base.streaming = false;
    base.fallbackUsed = true;
    base.hardReadOnly = readonly && result.exitCode === 0;
    const finalText = result.stdout.trim();
    const fallbackErrorMessage = redactSensitive(result.spawnError?.message ?? (result.stderr.trim() || 'Pi text-mode fallback failed.'));
    const needsDecision = /^\s*\[NEEDS_DECISION\]/i.test(finalText);
    const fallbackStatus = result.timedOut ? 'timed_out' : result.exitCode !== 0 ? 'failed' : needsDecision ? 'blocked' : finalText ? 'completed' : 'failed';
    const fallbackError = result.timedOut
      ? { code: 'TIMEOUT', message: 'Pi text-mode fallback timed out. Inspect the session and worktree before continuing.' }
      : result.exitCode !== 0
        ? { code: classifyFailure(result, fallbackArgs), message: fallbackErrorMessage }
        : needsDecision
          ? { code: 'NEEDS_DECISION', message: 'Pi marked this task as requiring a decision from the Supervisor.' }
        : !finalText
          ? { code: 'INCOMPLETE_OUTPUT', message: 'Pi text-mode fallback returned no final assistant text.' }
          : null;
    return {
      ...base,
      status: fallbackStatus,
      requiresHumanAction: fallbackStatus !== 'completed',
      exitCode: result.exitCode,
      durationMs: Date.now() - startTime,
      finalText: redactSensitive(finalText),
      usage: null,
      sessionFile: request.sessionFile ?? (sessionDir ? await findSessionFile(sessionDir, request.sessionId) : null),
      ...(fallbackError ? { error: fallbackError } : {}),
    };
  }

  const failureCode = classifyFailure(result, args);
  if (result.exitCode !== 0 && !result.state.executionStarted && ['UNSUPPORTED_OPTION', 'SESSION_UNSUPPORTED', 'UNKNOWN_MODEL'].includes(failureCode)) {
    base.capabilityDiscovery.push(await discover(executable, failureCode, request, options.spawnImpl));
    base.capabilityDiscoveryUsed = true;
  }
  let status = 'completed';
  let error;
  base.hardReadOnly = readonly && (result.state.executionStarted || result.state.agentEnded);
  if (result.timedOut) {
    status = 'timed_out';
    error = { code: 'TIMEOUT', message: `Pi exceeded timeoutMs=${request.timeoutMs}. The task may have changed files; inspect before continuing.` };
  } else if (result.spawnError || result.exitCode !== 0) {
    status = failureCode === 'PI_NOT_FOUND' ? 'blocked' : 'failed';
    error = { code: failureCode, message: redactSensitive(result.spawnError?.message ?? (result.stderr.trim() || `Pi exited with status ${result.exitCode}.`)) };
  } else if (result.malformedLines > 0 || !result.state.agentEnded || !(result.state.finalText || result.state.textDeltas).trim()) {
    status = 'failed';
    error = { code: result.malformedLines > 0 ? 'MALFORMED_STREAM' : 'INCOMPLETE_OUTPUT', message: 'Pi exited without a complete, parseable agent completion event. Do not replay automatically; inspect the session and worktree.' };
  } else if (/^\s*\[NEEDS_DECISION\]/i.test(result.state.finalText || result.state.textDeltas)) {
    status = 'blocked';
    error = { code: 'NEEDS_DECISION', message: 'Pi marked this task as requiring a decision from the Supervisor.' };
  }
  return {
    ...base,
    status,
    requiresHumanAction: status !== 'completed',
    exitCode: result.exitCode,
    durationMs: Date.now() - startTime,
    finalText: redactSensitive(result.state.finalText || result.state.textDeltas),
    usage: result.state.usage,
    sessionFile: request.sessionFile ?? (sessionDir ? await findSessionFile(sessionDir, request.sessionId) : null),
    ...(error ? { error } : {}),
  };
}

async function readRequestFromStdin(inputStream = process.stdin) {
  let input = '';
  const decoder = new TextDecoder('utf-8', { fatal: false });
  for await (const chunk of inputStream) {
    input += decoder.decode(chunk, { stream: true });
    try {
      const request = JSON.parse(input);
      inputStream.pause?.();
      return request;
    } catch {
      // A JSON request may be pretty-printed across multiple input chunks.
    }
  }
  input += decoder.decode();
  return JSON.parse(input);
}

async function main() {
  let request;
  try {
    request = await readRequestFromStdin();
  } catch {
    writeResult(fail('INVALID_REQUEST', 'stdin must contain one valid JSON object.'));
    process.exitCode = 2;
    return;
  }
  const result = await runRequest(request);
  writeResult(result);
  if (result.status !== 'completed') process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((error) => {
  writeResult(fail('RUNNER_ERROR', redactSensitive(error?.message ?? String(error))));
  process.exitCode = 1;
});

export { buildArgs, buildPrompt, buildWorkspacePolicy, classifyFailure, createEventParser, findSessionFile, getDelegatedSessionDir, makeProgressHandler, normalizeUsage, readRequestFromStdin, resolveWindowsNpmShim, runRequest, spawnOnce, validateRequest };
