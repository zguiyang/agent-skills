import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const skillPath = path.join(root, 'skills/pi-delegate/SKILL.md');
const contractPath = path.join(root, 'skills/pi-delegate/references/mcp-contract.md');
const readmePath = path.join(root, 'README.md');
const zhReadmePath = path.join(root, 'README.zh-CN.md');

async function text(file) {
  return readFile(file, 'utf8');
}

test('pi-delegate has valid identity metadata and an atomic-execution discovery description', async () => {
  const skill = await text(skillPath);
  assert.match(skill, /^---\nname: pi-delegate\ndescription: >-/);
  assert.match(skill, /short-description: Delegate bounded work through the registered pi-worker MCP\./);
  assert.match(skill, /bounded atomic execution tasks/);
  assert.match(skill, /regardless of task size/);
  assert.match(skill, /requirements, architecture, risk\n  decisions, coordination, integration, and final acceptance with the\n  Supervisor/);
  assert.doesNotMatch(skill, /non-trivial coding|keep trivial|trivial change|one-file trivial/);
});

test('policy defaults clear atomic execution to Pi without requiring every micro-operation to spawn', async () => {
  const [skill, contract] = await Promise.all([text(skillPath), text(contractPath)]);
  assert.match(skill, /Use Pi by default for a concrete execution task/);
  assert.match(skill, /a one-file edit, a read-only\nsearch, a single test run, a small bug fix, or a mechanical change/);
  assert.match(skill, /Do not create a Worker for every\nmicroscopic operation/);
  assert.match(contract, /small one-file edits, read-only inspection, one targeted test, small\nbug fixes, and mechanical changes/);
  assert.match(contract, /Task\nsize is not an eligibility rule/);
});

test('complex work is planned, split, dispatched, reviewed, and safely authorized by the Supervisor', async () => {
  const [skill, contract] = await Promise.all([text(skillPath), text(contractPath)]);
  assert.match(skill, /Never hand an ambiguous large goal to one Worker/);
  assert.match(skill, /splits it into independently verifiable\natomic tasks/);
  assert.match(skill, /selects serial or parallel execution/);
  assert.match(skill, /use `pi_continue` for a related follow-up/);
  assert.match(skill, /must obtain any required user authorization\nbefore destructive data operations, secrets or sensitive configuration work/);
  assert.match(contract, /The Supervisor keeps requirement interpretation, product and architecture\ndecisions, task decomposition/);
  assert.match(contract, /Atomicity does not authorize\ndestructive data work/);
});

test('Skill references all and only the public v0.1.1 MCP tools', async () => {
  const skill = await text(skillPath);
  const contract = await text(contractPath);
  const expected = ['pi_abort', 'pi_continue', 'pi_list', 'pi_spawn', 'pi_status', 'pi_steer'];
  for (const tool of expected) {
    assert.match(skill, new RegExp('`' + tool + '`'));
    assert.match(contract, new RegExp('`' + tool + '`'));
  }
  const mentioned = [...new Set((skill + contract).match(/\bpi_[a-z]+\b/g) ?? [])].sort();
  assert.deepEqual(mentioned, expected);
  assert.doesNotMatch(skill, /pi-worker\.mjs|child_process|JSONL|stdin\/argv/);
});

test('contract preserves the v0.1.1 inputs and lifecycle semantics', async () => {
  const contract = await text(contractPath);
  assert.match(contract, /`mode` is `direct` or `worktree`/);
  assert.match(contract, /`profile` is `inspect` or `implement`/);
  assert.match(contract, /`task`, absolute `cwd`, `mode`/);
  assert.match(contract, /`workerId`, `task`/);
  assert.match(contract, /There is no `sessionFile`, `sessionId`, provider field/);
  assert.match(contract, /omit it to inherit Pi's local default/);
  assert.match(contract, /`settled` means only that the\ncurrent activity cycle ended/);
  assert.match(contract, /release it with `pi_abort`/);
  assert.match(contract, /not an OS sandbox/);
});

test('profile capability and continuation boundaries prevent implicit escalation', async () => {
  const [skill, contract] = await Promise.all([text(skillPath), text(contractPath)]);
  assert.match(contract, /`inspect` has exactly `read`, `grep`, `find`, and `ls`/);
  assert.match(contract, /It has no `bash`, so it\ncannot run tests, builds, lint, or any other shell command/);
  assert.match(contract, /`implement` has `read`, `edit`, `write`, `bash`,/);
  assert.match(contract, /Mode and profile are selected at\nspawn and are not changed by `pi_continue`/);
  assert.match(skill, /cannot continue into a code change or shell-based\nverification: create a new `implement` Worker instead/);
});

test('worktree, task scope, and worker ID are not stronger isolation or persistence contracts', async () => {
  const [skill, contract] = await Promise.all([text(skillPath), text(contractPath)]);
  assert.match(contract, /worktree from Git `HEAD`; unstaged, staged, and untracked/);
  assert.match(contract, /Never auto-commit user work or alter Git\nhistory/);
  assert.match(contract, /There is no `allowedWriteScope` input/);
  assert.match(contract, /Task wording is not a\nfilesystem sandbox, and an `implement` Worker can run `bash`/);
  assert.match(skill, /Workers use `--no-session` and are held by the current MCP Server only/);
  assert.match(contract, /`workerId` is not a durable cross-restart session token/);
  assert.match(contract, /An aborted or\notherwise terminal Worker cannot be revived by `pi_continue`/);
});

test('policy permits independent read-only parallelism and protects write work', async () => {
  const skill = await text(skillPath);
  const contract = await text(contractPath);
  assert.match(skill, /multiple `inspect` workers only for genuinely independent read-only/);
  assert.match(skill, /Parallel implementation workers require separate\nworktrees and non-overlapping scope/);
  assert.match(contract, /Never place concurrent direct writes on overlapping scope/);
  assert.match(contract, /failed direct worker may have made partial edits/);
});

test('policy makes supervisor verification mandatory and has no silent fallback', async () => {
  const skill = await text(skillPath);
  const contract = await text(contractPath);
  assert.match(skill, /or fall back to the legacy\nPi CLI runner/);
  assert.match(skill, /Only the Supervisor may declare the overall task\ncomplete/);
  assert.match(contract, /not final acceptance/);
  assert.match(contract, /Do not repeat a potentially writing task blindly/);
});

test('legacy runner and its session-based assets are gone', async () => {
  for (const removed of [
    'skills/pi-delegate/scripts/pi-worker.mjs',
    'skills/pi-delegate/references/worker-contract.md',
    'tests/pi-delegate/fixtures/session-flash.jsonl',
  ]) {
    await assert.rejects(access(path.join(root, removed), constants.F_OK));
  }
});

test('English and Chinese READMEs expose the same installation and architecture contract', async () => {
  const [english, chinese] = await Promise.all([text(readmePath), text(zhReadmePath)]);
  for (const document of [english, chinese]) {
    assert.match(document, /npx -y @zguiyang\/pi-worker-mcp@0\.1\.1 setup/);
    assert.match(document, /npx skills add zguiyang\/agent-skills --skill pi-delegate -a codex -y/);
    assert.match(document, /pi_list/);
    assert.match(document, /pi_spawn/);
    assert.match(document, /pi_status/);
    assert.match(document, /pi_steer/);
    assert.match(document, /pi_continue/);
    assert.match(document, /pi_abort/);
    assert.match(document, /PI_WORKER_ALLOWED_ROOTS/);
    assert.match(document, /mcp-contract\.md/);
  }
});
