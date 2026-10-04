#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { open, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, resolve, win32 } from 'node:path';
import { homedir } from 'node:os';
import { TextDecoder } from 'node:util';
import { pathToFileURL } from 'node:url';

const THINKING_LEVELS = new Set(['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']);
const PROFILES = new Set(['readonly', 'implementation', 'verification']);
const WRITE_MODES = new Set(['direct', 'isolated']);
const READ_TOOLS = 'read,grep,find,ls';
const VERIFICATION_TOOLS = 'read,grep,find,ls,bash';
const WRITE_INTENT_PATTERN = /\b(implement|add|create|write|edit|modify|refactor|fix|migrate|rename|delete|remove|update|upgrade|apply|patch)\b/i;
const OBVIOUSLY_BROAD_PATTERN = /\b(entire|whole|all|every)\s+(?:the\s+)?(?:project|repo|repository|codebase|application|system|architecture|module)\b|\b(?:refactor|restructure|optimize|improve)\s+(?:the\s+)?(?:entire|whole|all)\s+(?:project|repo|repository|codebase|architecture)\b|整个(?:项目|仓库|代码库|系统|模块)|全局(?:重构|优化)|整体(?:重构|优化|架构改造)/i;
const REPORT_START = '---PI_TASK_REPORT---';
const REPORT_END = '---END_PI_TASK_REPORT---';
const SESSION_METADATA_BYTES = 256 * 1024;

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

function emptyReportFields() {
  return {
    summary: null,
    changedFiles: null,
    validation: null,
    remainingIssue: null,
    decisionNeeded: null,
    writeScope: null,
    scopeExceeded: null,
    outOfScopeFindings: [],
    reportParsed: false,
  };
}

function fail(code, message, fields = {}) {
  return { status: 'failed', requiresHumanAction: true, taskStarted: false, error: { code, message }, ...emptyReportFields(), ...fields };
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isStringOrStringArray(value) {
  return typeof value === 'string' || isStringArray(value);
}

function normalizeStringList(value) {
  if (value === undefined || value === null) return [];
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  return [];
}

function resolveModel(request) {
  const provider = nonEmptyString(request.provider);
  const model = nonEmptyString(request.model);
  if (!provider && !model) return { provider: null, model: null, source: 'pi_default' };
  if (!provider || !model) {
    return {
      provider,
      model,
      source: 'explicit',
      unresolved: 'provider and model must be supplied together when overriding Pi native model selection',
    };
  }
  return { provider, model, source: 'explicit' };
}

function looksVague(text) {
  const value = typeof text === 'string' ? text.trim() : '';
  if (!value) return true;
  if (value.length < 12) return true;
  if (OBVIOUSLY_BROAD_PATTERN.test(value)) return true;
  if (/^(please\s+)?(fix|do|handle|improve|work on|look into|clean up|update|change|help|refactor|implement|add|make)\s+(it|this|that|stuff|things|the (code|thing|stuff|project|repo|repository)|everything|something)\.?$/i.test(value)) return true;
  if (/^(please\s+)?(fix|change|update|improve|refactor)\s+(some|the)?\s*(code|stuff|things|bugs?)\.?$/i.test(value)) return true;
  return false;
}

function decision(type, reason, extra = {}) {
  return { type, reason, ...extra };
}

// Rejects requests that are not supervisor-defined atomic tasks before any Pi process starts.
function assessAtomicTask(request) {
  const objective = nonEmptyString(request.objective) ?? nonEmptyString(request.prompt);
  const structuredV2 = nonEmptyString(request.objective) !== null;
  if (request.action === 'continue') {
    if (!objective) return decision('needs_decision', 'A continuation request needs an objective or concrete review instruction.');
    if (looksVague(objective)) return decision('needs_decision', 'The continuation instruction is too vague/non-atomic.');
    if (structuredV2 && normalizeStringList(request.scope).length === 0) return decision('needs_decision', 'A non-empty scope is required (files, modules, or areas in play).');
    if (structuredV2 && !Array.isArray(request.constraints)) return decision('needs_decision', 'constraints must be supplied as an array, even if empty.');
    if (structuredV2 && normalizeStringList(request.acceptance).length === 0) return decision('needs_decision', 'At least one acceptance criterion is required.');
  } else {
    if (!objective) return decision('needs_decision', 'A structured objective is required; a free-form vague request is not accepted.');
    if (looksVague(objective)) return decision('needs_decision', 'The objective is too vague/non-atomic. State one concrete, bounded outcome.');
    if (normalizeStringList(request.scope).length === 0) return decision('needs_decision', 'A non-empty scope is required (files, modules, or areas in play).');
    if (!Array.isArray(request.constraints)) return decision('needs_decision', 'constraints must be supplied as an array, even if empty.');
    if (normalizeStringList(request.acceptance).length === 0) return decision('needs_decision', 'At least one acceptance criterion is required.');
  }
  if (request.writeMode) {
    if (normalizeStringList(request.allowedWriteScope).length === 0) return decision('needs_decision', 'writeMode requires a non-empty allowedWriteScope.');
    if (request.writeMode === 'direct') {
      if (request.workspaceStateKnown !== true) return decision('needs_decision', 'Direct writes require workspaceStateKnown: true from the supervisor.');
      if (request.writeAuthorization !== true) return decision('needs_decision', 'Direct writes require writeAuthorization: true from the supervisor.');
    }
  } else if (request.profile !== 'readonly' && request.workspaceMode !== 'delegated'
    && (structuredV2 || WRITE_INTENT_PATTERN.test(objective))) {
    return decision('needs_decision', 'Declare writeMode "direct" or "isolated" with allowedWriteScope, or use profile "readonly" for a pure read.');
  }
  return null;
}

function validateRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Request must be a JSON object.');
  if (!['delegate', 'continue'].includes(value.action)) throw new Error('action must be "delegate" or "continue".');
  for (const key of ['taskId', 'cwd']) {
    if (typeof value[key] !== 'string' || value[key].trim() === '') throw new Error(`${key} must be a non-empty string.`);
  }
  if (!isAbsolutePath(value.cwd)) throw new Error('cwd must be an absolute path.');
  if (value.objective !== undefined && (typeof value.objective !== 'string' || value.objective.trim() === '')) {
    throw new Error('objective must be a non-empty string when provided.');
  }
  if (value.prompt !== undefined && (typeof value.prompt !== 'string' || value.prompt.trim() === '')) {
    throw new Error('prompt must be a non-empty string when provided.');
  }
  if (!nonEmptyString(value.objective) && !nonEmptyString(value.prompt)) throw new Error('objective or prompt must be provided.');
  for (const key of ['scope', 'allowedWriteScope']) {
    if (value[key] !== undefined && !isStringOrStringArray(value[key])) throw new Error(`${key} must be a string or an array of strings.`);
  }
  if (value.constraints !== undefined && !isStringArray(value.constraints)) throw new Error('constraints must be an array of strings.');
  if (value.acceptance !== undefined && !isStringArray(value.acceptance)) throw new Error('acceptance must be an array of strings.');
  if (value.writeMode !== undefined && !WRITE_MODES.has(value.writeMode)) throw new Error('writeMode must be "direct" or "isolated".');
  if (value.writeMode && value.profile === 'readonly') throw new Error('writeMode cannot be combined with profile "readonly".');
  if (value.writeMode && value.workspaceMode === 'delegated') throw new Error('V2 writeMode uses a supervisor-supplied cwd; workspaceMode "delegated" is not allowed together with writeMode.');
  for (const key of ['workspaceStateKnown', 'writeAuthorization']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') throw new Error(`${key} must be a boolean when provided.`);
  }
  if (value.workspaceState !== undefined && typeof value.workspaceState !== 'string') throw new Error('workspaceState must be a string when provided.');
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

function buildWorkspacePolicy(request) {
  const cwd = request.cwd;
  const allowedWriteScope = normalizeStringList(request.allowedWriteScope);
  if (request.writeMode === 'direct') {
    return `Workspace mode: direct write. Work only in the supervisor-supplied cwd (${cwd}); the supervisor declares its workspace state known. Write only within: ${allowedWriteScope.join(', ')}. Do not create, switch, or clean worktrees or checkouts; do not reset, stash, clean, checkout over user state, commit, push, or merge. If a needed change is outside the allowed write scope, do not change it: report it as an out-of-scope finding and return [NEEDS_DECISION]. The Supervisor serializes overlapping writes in this cwd; if concurrency makes safety uncertain, stop and request a decision.`;
  }
  if (request.writeMode === 'isolated') {
    return `Workspace mode: isolated write. The supervisor supplied the isolated worktree (${cwd}) and owns its lifecycle. Write only within: ${allowedWriteScope.join(', ')}. Do not create, switch, or clean worktrees or checkouts; do not reset, stash, clean, checkout over user state, commit, push, or merge. Report any out-of-scope finding without changing it. The Supervisor ensures concurrently running write workers use disjoint worktrees and scopes.`;
  }
  if (request.workspaceMode === 'existing') {
    return `Workspace mode: existing. Work only in the supplied cwd (${cwd}). Do not create or switch worktrees or checkouts. Do not alter any other workspace.`;
  }
  if (request.action === 'continue') {
    return `Workspace mode: delegated continuation. The supplied cwd (${request.cwd}) must be the actual worktree path reported by the prior turn. Continue in this exact workspace and existing session; do not create or select another worktree. If the prior workspace path was not supplied, stop and return [NEEDS_DECISION].`;
  }
  if (request.profile === 'readonly') {
    return `Workspace mode: delegated. This task is read-only; do not create a worktree or modify files. Inspect only the supplied repository root (${request.cwd}).`;
  }
  return `Workspace mode: delegated. The supplied cwd (${request.cwd}) is the target repository root. Before any write, read its AGENTS.md and inspect relevant project Skills/rules for worktree management. If a project worktree Skill/rule exists, follow it to create an isolated worktree and perform every write and test there. If no such safe rule exists, or worktree creation fails, stop and return [NEEDS_DECISION]; do not edit this checkout or invent a fallback. Report the exact worktree path in the final response. Do not reset, stash, clean, overwrite branches, commit, push, or merge.`;
}

function buildReportInstruction() {
  return [
    'Final report format: end your final message with exactly one JSON object between the markers below.',
    'Use null or [] for anything you did not observe, and never claim file changes or validation you did not perform.',
    'List any out-of-scope finding in outOfScopeFindings without changing it.',
    REPORT_START,
    '{"summary":"...","changedFiles":[],"validation":[],"remainingIssue":null,"decisionNeeded":null,"writeScope":[],"scopeExceeded":false,"outOfScopeFindings":[]}',
    REPORT_END,
  ].join('\n');
}

function buildModelPolicy(request) {
  const resolved = resolveModel(request);
  if (resolved.source === 'explicit') {
    return `Model policy: use only the explicitly selected provider/model ${resolved.provider}/${resolved.model}. Do not switch models, start a replacement session, or retry on another model. If it is insufficient, stop and report decisionNeeded with reason, current_model, suggested_model, and why_upgrade_is_needed.`;
  }
  if (request.action === 'continue') {
    return 'Model policy: continue with the provider/model recorded in this Pi session. Do not change models or start a replacement session. Report the actual provider/model used.';
  }
  return 'Model policy: use the default model selected in the user’s native Pi configuration. Do not select a different model, upgrade, or start a replacement session. If the configured model is insufficient, stop and report decisionNeeded with reason, current_model, suggested_model, and why_upgrade_is_needed.';
}

function buildPrompt(request) {
  const objective = request.objective ?? request.prompt ?? '';
  const scope = normalizeStringList(request.scope);
  const constraints = Array.isArray(request.constraints) ? request.constraints.filter((item) => typeof item === 'string') : [];
  const acceptance = normalizeStringList(request.acceptance);
  const lines = [buildModelPolicy(request), '', 'Task:', objective];
  if (scope.length) lines.push('', 'Scope:', ...scope.map((item) => `- ${item}`));
  if (constraints.length) lines.push('', 'Constraints:', ...constraints.map((item) => `- ${item}`));
  if (acceptance.length) lines.push('', 'Acceptance criteria:', ...acceptance.map((item) => `- ${item}`));
  if (request.prompt && request.objective && request.prompt !== request.objective) {
    lines.push('', 'Additional context:', request.prompt);
  }
  const allowedWriteScope = normalizeStringList(request.allowedWriteScope);
  if (request.writeMode && allowedWriteScope.length) lines.push('', `Allowed write scope: ${allowedWriteScope.join(', ')}`);
  lines.push('', buildReportInstruction());
  return `${buildWorkspacePolicy(request)}\n\n${lines.join('\n')}`;
}

function buildArgs(request, streaming = true, promptTransport = 'stdin') {
  const args = [];
  const resolved = resolveModel(request);
  if (resolved.provider) args.push('--provider', resolved.provider);
  if (resolved.model) args.push('--model', resolved.model);
  if (request.thinking) args.push('--thinking', request.thinking);
  if (request.workspaceMode === 'delegated' || (request.action === 'delegate' && nonEmptyString(request.objective))) {
    args.push('--session-dir', getDelegatedSessionDir(request));
  }
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
    const modelCandidates = [event, event.message, event.assistantMessage, event.assistantMessageEvent, event.assistantMessageEvent?.message, ...(Array.isArray(event.messages) ? event.messages : [])];
    for (const candidate of modelCandidates) {
      const provider = candidate?.provider;
      const model = candidate?.model ?? candidate?.modelId;
      if (typeof provider === 'string' && typeof model === 'string') {
        state.provider = provider;
        state.model = model;
      }
    }
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

async function resolveWindowsNpmShim(executable, args, options = {}) {
  const platform = options.platform ?? process.platform;
  const env = options.env ?? process.env;
  const readFileImpl = options.readFileImpl ?? readFile;
  if (platform !== 'win32') return { executable, args };
  const pathApi = win32;
  const candidates = [];
  if (extname(executable)) candidates.push(executable);
  else for (const directory of (env.PATH ?? '').split(';')) candidates.push(pathApi.join(directory, `${executable}.cmd`));
  for (const candidate of candidates) {
    let content;
    try { content = await readFileImpl(candidate, 'utf8'); } catch { continue; }
    const match = content.match(/["']?((?:%~dp0|%dp0%)[^"'\r\n]*?\.js)["']?\s+%\*/i)
      ?? content.match(/["']([^"'\r\n]*?\.js)["']\s+%\*/i);
    if (!match) continue;
    const shimDirectory = pathApi.dirname(pathApi.resolve(candidate));
    const tokenMatch = match[1].match(/^(%~dp0|%dp0%)(.*)$/i);
    if (!tokenMatch) continue;
    const remainder = tokenMatch[2];
    const separator = remainder.startsWith('\\') ? '' : '\\';
    return { executable: process.execPath, args: [`${shimDirectory}${separator}${remainder}`, ...args] };
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
    const state = { eventsSeen: 0, executionStarted: false, agentEnded: false, textDeltas: '', finalText: '', usage: normalizeUsage(), provider: null, model: null };
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
      process.stderr.write(redactSensitive(text));
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
  if (['EACCES', 'EPERM'].includes(result.spawnError?.code) || /\b(?:EACCES|EPERM)\b|permission denied|operation not permitted|access is denied/i.test(text)) return 'SANDBOX_PERMISSION';
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

function extractDeniedPath(result) {
  const text = `${result.spawnError?.message ?? ''}\n${result.stderr}\n${result.stdout}`;
  const operationPath = text.match(/(?:mkdir|open|access|scandir|rename|unlink|rmdir)\s+['"]([^'"\r\n]+)['"]/i);
  if (operationPath) return operationPath[1];
  const quotedPath = text.match(/(?:EACCES|EPERM|permission denied|operation not permitted)[^\r\n]*?['"]((?:[A-Za-z]:\\|\/)[^'"\r\n]+)['"]/i);
  return quotedPath?.[1] ?? null;
}

async function discover(executable, kind, request, spawnImpl) {
  const resolved = resolveModel(request);
  if (kind === 'UNKNOWN_MODEL' && !resolved.provider) {
    return { kind, skipped: true, reason: 'Pi native default provider is not exposed by the failed startup.' };
  }
  const args = kind === 'UNKNOWN_MODEL' ? ['--list-models', resolved.provider ?? ''] : ['--help'];
  const filteredArgs = args.filter((part) => part !== '');
  const result = await spawnOnce(executable, filteredArgs, { cwd: request.cwd, spawnImpl });
  return { kind, exitCode: result.exitCode, output: redactSensitive(`${result.stdout}${result.stderr}`).slice(0, 12000) };
}

function extractSessionMetadata(text) {
  const meta = { sessionId: null, provider: null, model: null, thinking: null };
  for (const line of String(text).split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let entry;
    try { entry = JSON.parse(trimmed); } catch { continue; }
    if (!entry || typeof entry !== 'object') continue;
    if (entry.type === 'session' && typeof entry.id === 'string') meta.sessionId = entry.id;
    else if (entry.type === 'model_change' && typeof entry.provider === 'string' && typeof entry.modelId === 'string') {
      meta.provider = entry.provider;
      meta.model = entry.modelId;
    } else if (entry.type === 'thinking_level_change' && typeof entry.thinkingLevel === 'string') {
      meta.thinking = entry.thinkingLevel;
    } else if (entry.type === 'message' && entry.message?.role === 'assistant' && typeof entry.message.provider === 'string' && typeof entry.message.model === 'string') {
      meta.provider = entry.message.provider;
      meta.model = entry.message.model;
    }
  }
  return meta;
}

async function readSessionMetadata(sessionFile) {
  try {
    const handle = await open(sessionFile, 'r');
    try {
      const { size } = await handle.stat();
      const headBuffer = Buffer.alloc(Math.min(SESSION_METADATA_BYTES, size));
      const { bytesRead: headBytes } = await handle.read(headBuffer, 0, headBuffer.length, 0);
      const head = extractSessionMetadata(headBuffer.toString('utf8', 0, headBytes));
      if (size <= SESSION_METADATA_BYTES) return { ...head, readable: true };

      // Model changes and assistant messages are appended. Inspect the tail too;
      // if it cannot establish the latest model, fail closed rather than trusting a stale header.
      const tailLength = Math.min(SESSION_METADATA_BYTES, size);
      const tailBuffer = Buffer.alloc(tailLength);
      const { bytesRead: tailBytes } = await handle.read(tailBuffer, 0, tailBuffer.length, size - tailLength);
      const tail = extractSessionMetadata(tailBuffer.toString('utf8', 0, tailBytes));
      if (!tail.provider || !tail.model) return { ...head, provider: null, model: null, readable: true };
      return { ...head, provider: tail.provider, model: tail.model, thinking: tail.thinking ?? head.thinking, readable: true };
    } finally {
      await handle.close();
    }
  } catch {
    return { sessionId: null, provider: null, model: null, thinking: null, readable: false };
  }
}

async function updateExecutionMetadata(base, request, sessionDir, result) {
  const sessionFile = request.sessionFile ?? (sessionDir ? await findSessionFile(sessionDir, request.sessionId) : null);
  base.sessionFile = sessionFile;
  base.taskStarted = result.state.executionStarted;
  const metadata = sessionFile ? await readSessionMetadata(sessionFile) : null;
  base.provider = metadata?.provider ?? result.state.provider ?? request.provider ?? base.provider ?? null;
  base.model = metadata?.model ?? result.state.model ?? request.model ?? base.model ?? null;
  base.thinking = metadata?.thinking ?? request.thinking ?? base.thinking ?? null;
}

function parseTaskReport(text) {
  const source = typeof text === 'string' ? text : '';
  const start = source.lastIndexOf(REPORT_START);
  if (start === -1) return null;
  const end = source.indexOf(REPORT_END, start + REPORT_START.length);
  if (end === -1) return null;
  const candidate = source.slice(start + REPORT_START.length, end).trim();
  try {
    const parsed = JSON.parse(candidate);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function buildTaskReportFields(request, rawFinalText) {
  const writeScope = normalizeStringList(request.allowedWriteScope);
  const parsed = parseTaskReport(rawFinalText);
  const redactList = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string').map(redactSensitive) : null);
  return {
    summary: parsed && typeof parsed.summary === 'string' ? redactSensitive(parsed.summary) : null,
    changedFiles: parsed ? redactList(parsed.changedFiles) : null,
    validation: parsed ? redactList(parsed.validation) : null,
    remainingIssue: parsed && typeof parsed.remainingIssue === 'string' ? redactSensitive(parsed.remainingIssue) : null,
    decisionNeeded: parsed && parsed.decisionNeeded && typeof parsed.decisionNeeded === 'object' ? parsed.decisionNeeded : null,
    writeScope: writeScope.length ? writeScope : null,
    scopeExceeded: parsed && typeof parsed.scopeExceeded === 'boolean' ? parsed.scopeExceeded : null,
    outOfScopeFindings: parsed ? (redactList(parsed.outOfScopeFindings) ?? []) : [],
    reportParsed: parsed !== null,
  };
}

function blockedResult(base, request, startTime, decisionNeeded) {
  return {
    ...base,
    status: 'blocked',
    requiresHumanAction: true,
    exitCode: null,
    durationMs: Date.now() - startTime,
    finalText: '',
    usage: null,
    error: { code: 'NEEDS_DECISION', message: decisionNeeded.reason },
    ...buildTaskReportFields(request, ''),
    decisionNeeded,
  };
}

async function runRequest(rawRequest, options = {}) {
  let request;
  try {
    request = validateRequest(rawRequest);
    const info = await stat(request.cwd);
    if (!info.isDirectory()) throw new Error('cwd must point to an existing directory.');
    if (request.sessionFile) {
      const sessionInfo = await stat(request.sessionFile);
      if (!sessionInfo.isFile()) throw new Error('sessionFile must point to a file.');
    }
  } catch (error) {
    if (['EACCES', 'EPERM'].includes(error.code)) {
      return {
        ...fail('SANDBOX_PERMISSION', error.message, { taskStarted: false }),
        status: 'blocked',
        error: {
          code: 'SANDBOX_PERMISSION',
          message: redactSensitive(error.message),
          permissionDeniedPath: error.path ?? null,
          taskStarted: false,
          hostAction: 'Request access through the host Agent permission mechanism, then retry this request once.',
        },
      };
    }
    return fail('INVALID_REQUEST', error.message);
  }

  const executable = process.env.PI_EXECUTABLE || 'pi';
  const startTime = Date.now();
  const readonly = request.profile === 'readonly';
  let resolved = resolveModel(request);
  const sessionDir = request.workspaceMode === 'delegated' || (request.action === 'delegate' && nonEmptyString(request.objective))
    ? getDelegatedSessionDir(request)
    : null;
  const base = {
    action: request.action,
    taskId: request.taskId,
    sessionId: request.sessionId,
    cwd: request.cwd,
    workspaceMode: request.workspaceMode,
    writeMode: request.writeMode ?? null,
    sessionFile: request.sessionFile ?? null,
    provider: resolved.provider ?? null,
    model: resolved.model ?? null,
    modelSource: resolved.source,
    taskStarted: false,
    thinking: request.thinking ?? null,
    streaming: true,
    fallbackUsed: false,
    promptTransport: 'stdin',
    hardReadOnly: false,
    capabilityDiscovery: [],
    capabilityDiscoveryUsed: false,
  };

  // A missing provider/model deliberately leaves selection to Pi's native configuration.
  if (resolved.unresolved) {
    return blockedResult(base, request, startTime, decision('needs_decision', resolved.unresolved));
  }

  const atomicDecision = assessAtomicTask(request);
  if (atomicDecision) return blockedResult(base, request, startTime, atomicDecision);

  // Continuation must use the original cwd plus the exact sessionFile. Pi owns the
  // model recorded in that session unless the caller explicitly requests a match.
  if (request.action === 'continue') {
    if (!request.sessionFile) {
      return blockedResult(base, request, startTime, decision('needs_decision', 'Continuation requires the exact sessionFile from the prior worker result; sessionId alone is not sufficient.'));
    }
    const metadata = await readSessionMetadata(request.sessionFile);
    if (!metadata.provider || !metadata.model) {
      return blockedResult(base, request, startTime, decision('needs_decision', 'session_metadata_unavailable', {
        current_model: null,
        suggested_model: resolved.provider && resolved.model ? `${resolved.provider}/${resolved.model}` : null,
        why_upgrade_is_needed: `Could not determine the provider/model recorded in ${request.sessionFile}; refusing to launch so the caller can verify the session.`,
      }));
    }
    const existing = `${metadata.provider}/${metadata.model}`;
    const requested = resolved.provider && resolved.model ? `${resolved.provider}/${resolved.model}` : null;
    if (requested && existing !== requested) {
      return blockedResult(base, request, startTime, decision('needs_decision', 'session_model_conflict', {
        current_model: existing,
        suggested_model: requested,
        why_upgrade_is_needed: `The session file records ${existing}, but the effective model is ${requested}. Pass the session's own model explicitly or start a new session; the runner will not switch a live session's model.`,
        session_model: existing,
        requested_model: requested,
      }));
    }
    if (!requested) {
      resolved = { provider: metadata.provider, model: metadata.model, source: 'session' };
      base.provider = metadata.provider;
      base.model = metadata.model;
      base.modelSource = 'session';
      base.thinking = metadata.thinking ?? base.thinking;
    }
  }

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
    await updateExecutionMetadata(base, request, sessionDir, result);
    base.streaming = false;
    base.fallbackUsed = true;
    base.hardReadOnly = readonly && result.exitCode === 0;
    const finalText = result.stdout.trim();
    const fallbackFailureCode = classifyFailure(result, fallbackArgs);
    const fallbackPermissionFailure = result.exitCode !== 0 && fallbackFailureCode === 'SANDBOX_PERMISSION';
    base.taskStarted = fallbackPermissionFailure ? null : (result.exitCode === 0 || Boolean(finalText));
    const fallbackErrorMessage = redactSensitive(result.spawnError?.message ?? (result.stderr.trim() || 'Pi text-mode fallback failed.'));
    const needsDecision = /^\s*\[NEEDS_DECISION\]/i.test(finalText);
    const fallbackStatus = result.timedOut ? 'timed_out' : fallbackPermissionFailure ? 'blocked' : result.exitCode !== 0 ? 'failed' : needsDecision ? 'blocked' : finalText ? 'completed' : 'failed';
    const fallbackError = result.timedOut
      ? { code: 'TIMEOUT', message: 'Pi text-mode fallback timed out. Inspect the session and worktree before continuing.' }
      : fallbackPermissionFailure
        ? {
          code: 'SANDBOX_PERMISSION',
          message: fallbackErrorMessage,
          permissionDeniedPath: extractDeniedPath(result),
          taskStarted: null,
          hostAction: 'The text-mode fallback cannot prove whether task execution began. Inspect the session and workspace before any retry; request access through the host Agent.',
        }
        : result.exitCode !== 0
        ? { code: fallbackFailureCode, message: fallbackErrorMessage }
        : needsDecision
          ? { code: 'NEEDS_DECISION', message: 'Pi marked this task as requiring a decision from the Supervisor.' }
        : !finalText
          ? { code: 'INCOMPLETE_OUTPUT', message: 'Pi text-mode fallback returned no final assistant text.' }
          : null;
    const fallbackReport = buildTaskReportFields(request, finalText);
    const fallbackDecision = fallbackReport.decisionNeeded && fallbackStatus === 'completed';
    const resolvedFallbackStatus = fallbackDecision ? 'blocked' : fallbackStatus;
    const resolvedFallbackError = fallbackDecision
      ? { code: 'NEEDS_DECISION', message: 'Pi reported decisionNeeded in the structured task report.' }
      : fallbackError;
    return {
      ...base,
      status: resolvedFallbackStatus,
      requiresHumanAction: resolvedFallbackStatus !== 'completed',
      exitCode: result.exitCode,
      durationMs: Date.now() - startTime,
      finalText: redactSensitive(finalText),
      usage: null,
      ...fallbackReport,
      ...(resolvedFallbackError ? { error: resolvedFallbackError } : {}),
    };
  }

  await updateExecutionMetadata(base, request, sessionDir, result);
  const failureCode = classifyFailure(result, args);
  if (result.exitCode !== 0 && !result.state.executionStarted && ['UNSUPPORTED_OPTION', 'SESSION_UNSUPPORTED', 'UNKNOWN_MODEL'].includes(failureCode)) {
    const discovery = await discover(executable, failureCode, request, options.spawnImpl);
    base.capabilityDiscovery.push(discovery);
    base.capabilityDiscoveryUsed = !discovery.skipped;
  }
  let status = 'completed';
  let error;
  base.hardReadOnly = readonly && (result.state.executionStarted || result.state.agentEnded);
  if (result.timedOut) {
    status = 'timed_out';
    error = { code: 'TIMEOUT', message: `Pi exceeded timeoutMs=${request.timeoutMs}. The task may have changed files; inspect before continuing.` };
  } else if (result.spawnError || result.exitCode !== 0) {
    status = failureCode === 'PI_NOT_FOUND' || (failureCode === 'SANDBOX_PERMISSION' && !result.state.executionStarted) ? 'blocked' : 'failed';
    error = { code: failureCode, message: redactSensitive(result.spawnError?.message ?? (result.stderr.trim() || `Pi exited with status ${result.exitCode}.`)) };
    if (failureCode === 'SANDBOX_PERMISSION') {
      error.permissionDeniedPath = extractDeniedPath(result);
      error.taskStarted = result.state.executionStarted;
      error.hostAction = result.state.executionStarted
        ? 'Do not replay automatically; inspect the session and workspace.'
        : 'Request access through the host Agent permission mechanism, then retry this request once.';
    }
  } else if (result.malformedLines > 0 || !result.state.agentEnded || !(result.state.finalText || result.state.textDeltas).trim()) {
    status = 'failed';
    error = { code: result.malformedLines > 0 ? 'MALFORMED_STREAM' : 'INCOMPLETE_OUTPUT', message: 'Pi exited without a complete, parseable agent completion event. Do not replay automatically; inspect the session and worktree.' };
  } else if (/^\s*\[NEEDS_DECISION\]/i.test(result.state.finalText || result.state.textDeltas)) {
    status = 'blocked';
    error = { code: 'NEEDS_DECISION', message: 'Pi marked this task as requiring a decision from the Supervisor.' };
  }
  const rawFinalText = result.state.finalText || result.state.textDeltas;
  const reportFields = buildTaskReportFields(request, rawFinalText);
  if (reportFields.decisionNeeded && status === 'completed') {
    status = 'blocked';
    error = { code: 'NEEDS_DECISION', message: 'Pi reported decisionNeeded in the structured task report.' };
  }
  return {
    ...base,
    status,
    requiresHumanAction: status !== 'completed',
    exitCode: result.exitCode,
    durationMs: Date.now() - startTime,
    finalText: redactSensitive(rawFinalText),
    usage: result.state.usage,
    ...reportFields,
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

export {
  assessAtomicTask,
  buildArgs,
  buildPrompt,
  buildTaskReportFields,
  buildWorkspacePolicy,
  classifyFailure,
  createEventParser,
  extractSessionMetadata,
  findSessionFile,
  getDelegatedSessionDir,
  looksVague,
  makeProgressHandler,
  normalizeUsage,
  parseTaskReport,
  readRequestFromStdin,
  readSessionMetadata,
  resolveModel,
  resolveWindowsNpmShim,
  runRequest,
  spawnOnce,
  validateRequest,
};
