import * as vscode from 'vscode';
import { GitLogViewer } from './gitLogViewer';
import { performGitReset } from './gitReset';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vsc-git-history" is now active!');

    const gitLogDataProvider = new GitLogDataProvider();
    vscode.window.createTreeView('gitLogViewer', { treeDataProvider: gitLogDataProvider });

    let disposable = vscode.commands.registerCommand('vsc-git-history.performGitReset', async (commitHash: string) => {
        const resetType = await vscode.window.showQuickPick(['Soft Reset', 'Hard Reset'], {
            placeHolder: 'Choose reset type',
        });
        if (resetType) {
            performGitReset(commitHash, resetType).catch(error => {
                console.error('Failed to perform git reset:', error);
                vscode.window.showErrorMessage(`Failed to perform git reset. See console for details.`);
            });
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

class GitLogDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    async getTreeItem(element: vscode.TreeItem): Promise<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            const gitLog = await GitLogViewer.getGitLog();
            if (gitLog && gitLog.length > 0) {
                return gitLog.map(commit => {
                    let item = new vscode.TreeItem(`${commit.hash.substring(0, 7)} - ${commit.date} - ${commit.message}`, vscode.TreeItemCollapsibleState.None);
                    item.tooltip = `Reset to ${commit.hash}`;
                    item.command = { 
                        command: 'vsc-git-history.performGitReset', 
                        title: "Perform Git Reset", 
                        arguments: [commit.hash]
                    };
                    return item;
                });
            } else {
                vscode.window.showInformationMessage('No git log available.');
                return [];
            }
        } else {
            return [];
        }
    }
}
