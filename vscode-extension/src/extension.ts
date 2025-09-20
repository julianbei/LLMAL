import * as vscode from 'vscode';

let highlightingEnabled = true;
let decoration: vscode.TextEditorDecorationType;

function makeDecoration() {
  return vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    border: '1px solid rgba(130,130,130,0.35)',
    backgroundColor: new vscode.ThemeColor('editor.rangeHighlightBackground'),
    overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.modifiedForeground'),
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  });
}

const BLOCK_REGEX = /@LLMAL[\s\S]*?@LLMAL:END/g;

function updateHighlights(editor?: vscode.TextEditor) {
  if (!highlightingEnabled) return;
  editor = editor || vscode.window.activeTextEditor;
  if (!editor) return;

  const text = editor.document.getText();
  const ranges: vscode.DecorationOptions[] = [];
  for (const match of text.matchAll(BLOCK_REGEX)) {
    const start = editor.document.positionAt(match.index || 0);
    const end = editor.document.positionAt((match.index || 0) + match[0].length);
    ranges.push({
      range: new vscode.Range(start, end),
      hoverMessage: 'LLMAL block'
    });
  }
  editor.setDecorations(decoration, ranges);
}

function extractBlocks(document: vscode.TextDocument) {
  const text = document.getText();
  const blocks: { start: number; end: number; content: string }[] = [];
  for (const match of text.matchAll(BLOCK_REGEX)) {
    blocks.push({
      start: match.index || 0,
      end: (match.index || 0) + match[0].length,
      content: match[0]
    });
  }
  return blocks;
}

export function activate(context: vscode.ExtensionContext) {
  decoration = makeDecoration();
  if (vscode.window.activeTextEditor) updateHighlights();

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => {
      const ed = vscode.window.activeTextEditor;
      if (ed && e.document === ed.document) updateHighlights(ed);
    }),
    vscode.window.onDidChangeActiveTextEditor(ed => updateHighlights(ed))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('llmal.toggleHighlight', () => {
      highlightingEnabled = !highlightingEnabled;
      if (!highlightingEnabled) {
        vscode.window.activeTextEditor?.setDecorations(decoration, []);
      } else {
        updateHighlights();
      }
      vscode.window.setStatusBarMessage(`LLMAL highlighting: ${highlightingEnabled ? 'ON' : 'OFF'}`, 2000);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('llmal.extractBlocks', async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed) return;
      const blocks = extractBlocks(ed.document);
      if (!blocks.length) {
        vscode.window.showInformationMessage('No @LLMAL blocks found in current file.');
        return;
      }
      const items = blocks.map((b, i) => ({
        label: `Block ${i + 1} (${b.start}-${b.end})`,
        detail: ed.document.fileName,
        description: '',
        content: b.content
      }));
      const picked = await vscode.window.showQuickPick(items, { placeHolder: 'LLMAL blocks' });
      if (picked) {
        const doc = await vscode.workspace.openTextDocument({ content: picked.content, language: 'json' });
        vscode.window.showTextDocument(doc, { preview: true });
      }
    })
  );
}

export function deactivate() {}
