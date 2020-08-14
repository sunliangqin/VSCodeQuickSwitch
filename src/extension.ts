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
            return path.resolve(filePath).replace(/\\/g, "/");
        });
    }
}

class QuickOpenKeyword {
    constructor(public readonly pattern: string, public readonly result: string) {
    }

    convert(file: string) {
        return this.pattern && this.result ?
            file.replace(new RegExp(this.pattern), this.result) :
            path.parse(file).base;
    }
}

class Config {
    static LoadRules() : Rule[] {
        const rules = vscode.workspace.getConfiguration().get<Rule[]>(
            'quickSwitch.rules', []);
        return rules.map(x => new Rule(x.pattern, x.list));
    }

    static LoadFallbackToQuickOpen() : boolean {
        return vscode.workspace.getConfiguration().get<boolean>(
            "quickSwitch.fallbackToQuickOpen", true);
    }

    static LoadQuickOpenKeyword() : QuickOpenKeyword {
        const quickOpenKeyword = vscode.workspace.getConfiguration()
            .get<QuickOpenKeyword>('quickSwitch.quickOpenKeyword');
        return new QuickOpenKeyword(quickOpenKeyword?.pattern ?? "",
            quickOpenKeyword?.result ?? "");
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
        console.info(`Current file path: ${currentFilePath}`);

        const rules = Config.LoadRules();
        const matchedRule = rules.find(x => x.match(currentFilePath));
        console.info(`Matched rule: ${JSON.stringify(matchedRule)}`);
        let files = matchedRule?.expand(currentFilePath) || map.get(currentFilePath) || [];
        console.info(`Files: ${files}`);

        let file;
        const candidates = files.filter(x => x != currentFilePath && fs.existsSync(x));
        console.info(`Candidates: ${candidates}`);
        if (candidates.length > 0) {
            if (candidates.length == 1) {
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

            console.info(`Switch to ${file}`);
            const document = await vscode.workspace.openTextDocument(file);
            vscode.window.showTextDocument(document);
        } else {
            const fallbackToQuickOpen = Config.LoadFallbackToQuickOpen();
            if (fallbackToQuickOpen) {
                var quickOpenKeyword = Config.LoadQuickOpenKeyword();
                var keyword = quickOpenKeyword.convert(currentFilePath);

                console.info(`Search files with keyword ${keyword}`);
                vscode.commands.executeCommand("workbench.action.quickOpen", keyword);
            }
        }
    }));
}