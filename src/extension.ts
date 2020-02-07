import * as fs from 'fs';
import *  as path from 'path';
import * as vscode from 'vscode';

const map = new Map<string, string[]>();

class FileGroup {
    pattern: string;
    list: string[];

    constructor(pattern: string, list: string[]) {
        this.pattern = pattern;
        this.list = list;
    }

    match(file: string) {
        return file.match(this.pattern);
    }

    getList(file: string) {
        const result = [];
        for (const item of this.list) {
            const filePath = file.replace(new RegExp(this.pattern), item);
            result.push(path.resolve(filePath));
        }

        return result;
    }
}

class Configuration {
    static Load() {
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

function getCurrentFilePath() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
        return;
    }

    return activeTextEditor.document.fileName;
}

async function actionOnSelectedFile(
    filterCallback: (currentIndex: number, files: string[]) => Promise<string | undefined>,
    actionCallback: (filePath: string) => void) {

    const currentFilePath = getCurrentFilePath();
    if (!currentFilePath) {
        return;
    }

    const fileGroups = Configuration.Load();
    for (const fileGroup of fileGroups) {
        let files;
        if (fileGroup.match(currentFilePath)) {
            files = fileGroup.getList(currentFilePath);
        }
        else {
            files = map.get(currentFilePath) || [];
        }
        if (files.length === 0) {
            continue;
        }

        const currentIndex = files.indexOf(currentFilePath);
        const file = await filterCallback(currentIndex, files);
        if (!file || !fs.existsSync(file)) {
            return;
        }

        if (!fileGroup.match(file)) {
            map.set(file, files);
        }

        actionCallback(file);
        return;
    }
}

async function selectFileFromPick(currentIndex: number, files: string[]) {
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
}

function showFile(filePath: string) {
    vscode.workspace.openTextDocument(filePath).then(vscode.window.showTextDocument);
}

function compareFiles(leftFilePath: string, rightFilePath: string) {
    const leftFileUri = vscode.Uri.file(leftFilePath);
    const rightFileUri = vscode.Uri.file(rightFilePath);
    const title = `${path.basename(leftFilePath)} ↔ ${path.basename(rightFilePath)}`;

    return vscode.commands.executeCommand('vscode.diff', leftFileUri, rightFileUri, title);
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.compareAsLeftFile',
            () => actionOnSelectedFile(selectFileFromPick, (filePath) => {
                const currentFilePath = getCurrentFilePath();
                if (!currentFilePath) {
                    return;
                }

                compareFiles(currentFilePath, filePath);
            }))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.compareAsRightFile',
            () => actionOnSelectedFile(selectFileFromPick, (filePath) => {
                const currentFilePath = getCurrentFilePath();
                if (!currentFilePath) {
                    return;
                }

                compareFiles(filePath, currentFilePath);
            }))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchFile',
            () => actionOnSelectedFile(selectFileFromPick, showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchNextFile',
            () => {
                actionOnSelectedFile(
                    async (currentIndex, files) => {
                        for (let i = 1; i < files.length; i++) {
                            const file = files[(currentIndex + i) % files.length];
                            if (fs.existsSync(file)) {
                                return file;
                            }
                        }
                    }, showFile);
            }));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchPreviousFile',
            () => {
                actionOnSelectedFile(
                    async (currentIndex, files) => {
                        for (let i = 1; i < files.length; i++) {
                            const file = files[(currentIndex - i + files.length) % files.length];
                            if (fs.existsSync(file)) {
                                return file;
                            }
                        }
                    }, showFile);
            }));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex1',
            () => actionOnSelectedFile(async (currentIndex, files) => files[0], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex2',
            () => actionOnSelectedFile(async (currentIndex, files) => files[1], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex3',
            () => actionOnSelectedFile(async (currentIndex, files) => files[2], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex4',
            () => actionOnSelectedFile(async (currentIndex, files) => files[3], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex5',
            () => actionOnSelectedFile(async (currentIndex, files) => files[4], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex6',
            () => actionOnSelectedFile(async (currentIndex, files) => files[5], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex7', () =>
            actionOnSelectedFile(async (currentIndex, files) => files[6], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex8', () =>
            actionOnSelectedFile(async (currentIndex, files) => files[7], showFile)
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.switchAtIndex9', () =>
            actionOnSelectedFile(async (currentIndex, files) => files[8], showFile)
        ));
}