import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const map = new Map<string, string[]>();

class Rule {
    constructor(public readonly pattern: string, public readonly list: string[]) {
    }

    match(file: string) {
        return file.match(this.pattern);
    }

    expand(file: string) {
        return this.list.map(x => {
            const filePath = file.replace(new RegExp(this.pattern), x);
            return path.resolve(filePath);
        });
    }
}

class Configuration {
    static Load() {
        const rules = vscode.workspace.getConfiguration().get<Rule[]>(
            'quickSwitch.rules', []);
        return rules.map(x => new Rule(x.pattern, x.list));
    }
}

class FileQuickPickItem implements vscode.QuickPickItem {
    constructor(public readonly label: string, public readonly path: string) {
    }
}

async function selectFileFromPick(files: string[]) {
    const fileQuickPickItems = files.map(x => {
        const relativePath = vscode.workspace.asRelativePath(x);
        return new FileQuickPickItem('$(file)  ' + relativePath, x);
    });

    const selectedFile = await vscode.window.showQuickPick(fileQuickPickItems,
        { placeHolder: 'Switch to file' });
    return selectedFile?.path;
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('quickSwitch.switchFile', async () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return;
        }
        const currentFilePath = activeTextEditor.document.fileName.replace(/\\/g, "/");

        const rules = Configuration.Load();
        const matchedRule = rules.find(x => x.match(currentFilePath));
        let files = matchedRule?.expand(currentFilePath) || map.get(currentFilePath) || [];

        let file;
        const candidates = files.filter(x => x != currentFilePath && fs.existsSync(x));
        if (candidates.length == 0) {
            return;
        } else if (candidates.length == 1) {
            file = candidates[0];
        } else {
            file = await selectFileFromPick(candidates);
            if (!file) {
                return;
            }
        }

        if (!matchedRule?.match(file)) {
            map.set(file, files);
        }

        const document = await vscode.workspace.openTextDocument(file);
        vscode.window.showTextDocument(document);
    }));
}