import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const map = new Map<string, string[]>();

class FileGroup {
    constructor(public readonly pattern: string, public readonly list: string[]) { }

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
        const fileGroupsConfig = vscode.workspace.getConfiguration().get<FileGroup[]>(
            'quickSwitch.fileGroups', []);
        return fileGroupsConfig.map(x => new FileGroup(x.pattern, x.list));
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
        { placeHolder: "Switch to file" });
    return selectedFile?.path;
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('quick-switch.switchFile', async () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return;
        }
        const currentFilePath = activeTextEditor.document.fileName;

        const fileGroups = Configuration.Load();
        const matchedFileGroup = fileGroups.find(x => x.match(currentFilePath));
        let files = matchedFileGroup?.expand(currentFilePath) || map.get(currentFilePath) || [];

        const candidates = files.filter(x => x != currentFilePath && fs.existsSync(x));
        if (candidates.length == 0) {
            return;
        }

        const file = await selectFileFromPick(candidates);
        if (!file) {
            return;
        }

        if (!matchedFileGroup?.match(file)) {
            map.set(file, files);
        }

        const document = await vscode.workspace.openTextDocument(file);
        vscode.window.showTextDocument(document);
    }));
}