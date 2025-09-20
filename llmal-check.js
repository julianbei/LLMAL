// Minimal LLMAL CI check: parse blocks, map them to code regions, validate PR metadata.
// Usage: node tools/llmal-check.js --base "$BASE" --head "$HEAD" --prBody "$PR_BODY"
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')));
const base = args['--base'] || 'origin/main';
const head = args['--head'] || 'HEAD';
const prBody = (args['--prBody'] || '').toLowerCase();
const forceFlag = prBody.includes('force: true') || prBody.includes('llm-force: true');

function git(cmd) { return execSync(`git ${cmd}`, { encoding: 'utf8' }); }
function listChangedFiles() {
  const out = git(`diff --name-only ${base}...${head}`);
  return out.trim().split('\n').filter(Boolean);
}
function readFile(path) { try { return fs.readFileSync(path, 'utf8'); } catch { return ''; } }

function extractBlocks(src) {
  const lines = src.split(/\r?\n/);
  const blocks = [];
  let inBlock = false, start = -1, raw = [];
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (!inBlock && L.includes('@LLMAL')) {
      inBlock = true; start = i; raw = [L];
    } else if (inBlock) {
      raw.push(L);
      if (L.includes('@LLMAL:END')) {
        blocks.push({ startLine: start, endLine: i, raw: raw.join('\n') });
        inBlock = false; raw = [];
      }
    }
  }
  return blocks;
}

function parseBlockRaw(raw) {
  const payloadLines = raw.split('\n')
    .map(l => l.replace(/^\s*\/\*+|\*+\/\s*$|^\s*\/{2,}|\s*\*|\s*#\s?/g, ''))
    .filter(l => !l.includes('@LLMAL') && !l.includes('@LLMAL:END') && l.trim() !== '');
  const payload = payloadLines.join('\n').trim();
  try {
    if (payload.startsWith('{') || payload.startsWith('[')) return JSON.parse(payload);
  } catch {}
  // naive YAML: key: value pairs only
  const obj = {}; let current = obj; const stack = [];
  payload.split('\n').forEach(line => {
    const m = line.match(/^(\s*)([^:#]+):\s*(.*)$/);
    if (!m) return;
    const indent = m[1].length, key = m[2].trim(), val = m[3].trim();
    while (stack.length && stack[stack.length-1].indent >= indent) stack.pop();
    current = stack.length ? stack[stack.length-1].obj : obj;
    if (val === '' ) { current[key] = {}; stack.push({ indent, obj: current[key] }); }
    else if (val === 'true' || val === 'false') { current[key] = (val === 'true'); }
    else if (/^\d+$/.test(val)) { current[key] = Number(val); }
    else { current[key] = val.replace(/^"|"$/g,''); }
  });
  return obj;
}

function changedHunks(path) {
  const out = git(`diff -U0 ${base}...${head} -- "${path}"`);
  const hunks = [];
  for (const line of out.split('\n')) {
    const m = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (m) {
      const start = Number(m[1]);
      const count = Number(m[2] || 1);
      hunks.push({ start, end: start + count - 1 });
    }
  }
  return hunks;
}

function rangeOverlap(a, b) { return a.start <= b.end && b.start <= a.end; }

function asLineRange(block) { return { start: block.endLine + 1, end: block.endLine + 300 }; }

function hasAnnotation(annotations, type) {
  return (annotations||[]).some(a => (a.type||'').toLowerCase() === type.toLowerCase());
}

function run() {
  const files = listChangedFiles();
  const violations = [];
  const notes = [];

  for (const f of files) {
    const src = readFile(f);
    if (!src) continue;
    const blocks = extractBlocks(src).map(b => ({ ...b, parsed: parseBlockRaw(b.raw) }));
    if (!blocks.length) continue;

    const hunks = changedHunks(f);
    for (const b of blocks) {
      const p = b.parsed || {};
      const anns = Array.isArray(p.annotations) ? p.annotations : [];
      const scope = p.scope || 'region';
      const protectedAnn = anns.find(a => a.type === 'Protect' && ['final','frozen'].includes(a.level));
      if (protectedAnn) {
        const protectedRange = asLineRange(b);
        const touched = hunks.some(h => rangeOverlap(h, protectedRange));
        if (touched && !forceFlag) {
          violations.push(`[${f}] Edited protected region (scope=${scope}, id=${p.id||'n/a'}) without Force.`);
        } else if (touched && forceFlag) {
          const hasCleanup = hasAnnotation(anns, 'Purpose') || hasAnnotation(anns, 'OpenTasks') || hasAnnotation(anns, 'NeedsTests');
          if (!hasCleanup) {
            violations.push(`[${f}] Force used but missing cleanup/explain annotations (Purpose/OpenTasks/NeedsTests).`);
          } else {
            notes.push(`[${f}] Force acknowledged with cleanup annotations.`);
          }
        }
      }
    }
  }

  if (violations.length) {
    console.error('LLMAL violations:\n' + violations.map(v => ' - ' + v).join('\n'));
    process.exit(2);
  }
  if (notes.length) console.log(notes.join('\n'));
  console.log('LLMAL check passed.');
}

run();
