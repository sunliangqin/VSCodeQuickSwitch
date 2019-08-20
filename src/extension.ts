import * as vscode from 'vscode';
import * as fs from 'fs';

class FileGroup {
    pattern: string;
    list: string[];

    constructor(pattern: string, list: string[]) {
        this.pattern = pattern;
        this.list = list;
    }

    getList(filePath: string) {
        const result = [];
        if (filePath.match(this.pattern)) {
            for (const file of this.list) {
                result.push(filePath.replace(new RegExp(this.pattern), file));
            }
        }

        return result;
    }
}

class Configuration {
    static Load(): FileGroup[] {
        const fileGroups = [];
        const fileGroupsConfig = vscode.workspace.getConfiguration().get<FileGroup[]>('quickSwitch.fileGroups');
        if (fileGroupsConfig) {
            for (const fileGroupConfig of fileGroupsConfig) {
                fileGroups.push(new FileGroup(fileGroupConfig.pattern, fileGroupConfig.list));
            }
        }

        return fileGroups;
    }
}

class FileQuickPickItem implements vscode.QuickPickItem {
    constructor(public readonly label: string, public readonly path: string) {
    }
}

async function switchFile(callback: (currentIndex: number, files: string[]) => Promise<string | undefined>) {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
        return;
    }

    const currentFilePath = activeTextEditor.document.fileName;
    const fileGroups = Configuration.Load();
    for (const fileGroup of fileGroups) {
        const files = fileGroup.getList(currentFilePath);
        if (files.length === 0) {
            continue;
        }

        const currentIndex = files.indexOf(currentFilePath);
        const file = await callback(currentIndex, files);
        if (!file || !fs.existsSync(file)) {
            return;
        }

        const document = await vscode.workspace.openTextDocument(file);
        vscode.window.showTextDocument(document);
        return;
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.switchFile', () => {
        switchFile(async (currentIndex, files) => {
            const fileQuickPickItems = [];
            for (const file of files) {
                if (!fs.existsSync(file)) {
                    continue;
                }

                const relativePath = vscode.workspace.asRelativePath(file);
                fileQuickPickItems.push(new FileQuickPickItem('$(file)  ' + relativePath, file));
            }

            if (fileQuickPickItems.length === 0) {
                return;
            }

            const selectedFile = await vscode.window.showQuickPick(fileQuickPickItems);
            if (!selectedFile) {
                return;
            }

            return selectedFile.path;
        });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchNextFile', () => {
        switchFile(async (currentIndex, files) => files[++currentIndex % files.length]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchPreviousFile', () => {
        switchFile(async (currentIndex, files) => files[(--currentIndex + files.length) % files.length]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex1', () => {
        switchFile(async (currentIndex, files) => files[0]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex2', () => {
        switchFile(async (currentIndex, files) => files[1]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex3', () => {
        switchFile(async (currentIndex, files) => files[2]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex4', () => {
        switchFile(async (currentIndex, files) => files[3]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex5', () => {
        switchFile(async (currentIndex, files) => files[4]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex6', () => {
        switchFile(async (currentIndex, files) => files[5]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex7', () => {
        switchFile(async (currentIndex, files) => files[6]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex8', () => {
        switchFile(async (currentIndex, files) => files[7]);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.switchAtIndex9', () => {
        switchFile(async (currentIndex, files) => files[8]);
    }));
}