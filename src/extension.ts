// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitLogViewer } from './gitLogViewer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vsc-git-history" is now active!');

    // Register the command that fetches and displays the git log
    let disposable = vscode.commands.registerCommand('vsc-git-history.viewGitLog', async () => {
        try {
            const gitLog = await GitLogViewer.getGitLog();
            if (gitLog) {
                vscode.window.showInformationMessage(`Git Log:\n${gitLog}`);
            } else {
                vscode.window.showInformationMessage('No git log available.');
            }
        } catch (error) {
            console.error('Error fetching git log:', error);
            vscode.window.showErrorMessage('Failed to fetch git log. See console for details.');
        }
    });

    context.subscriptions.push(disposable);

    // Register a view and its associated view container in the activity bar
    const gitHistoryView = vscode.window.createTreeView('vscGitHistory', {
        treeDataProvider: new GitLogDataProvider(),
        showCollapseAll: true,
    });
    context.subscriptions.push(gitHistoryView);
}

class GitLogDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    async getTreeItem(element: vscode.TreeItem): Promise<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (element) {
            // If there is an element, it means we are looking for child nodes of that element which we do not have in this simple example
            return [];
        } else {
            // Fetch the git log and map it to TreeItems
            try {
                const gitLog = await GitLogViewer.getGitLog();
                if (gitLog) {
                    const commits = gitLog.split('\n').filter(line => line.trim() !== '').map(commitLine => {
                        const [hash, date, ...messageParts] = commitLine.split(' - ');
                        const message = messageParts.join(' - ');
                        return new vscode.TreeItem(`${hash} - ${message}`);
                    });
                    return commits;
                } else {
                    return [];
                }
            } catch (error) {
                console.error('Failed to fetch git log for tree view:', error);
                vscode.window.showErrorMessage('Failed to fetch git log for tree view. See console for details.');
                return [];
            }
        }
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}