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
            if (gitLog.length > 0) {
                const gitLogMessages = gitLog.map(commit => `${commit.hash} - ${commit.date} - ${commit.message}`).join('\n');
                vscode.window.showInformationMessage(`Git Log:\n${gitLogMessages}`);
                console.log(`Git Log:\n${gitLogMessages}`); // Logging the git log for debugging
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
    const gitHistoryView = vscode.window.createTreeView('gitLogViewer', {
        treeDataProvider: new GitLogDataProvider(),
        showCollapseAll: true,
    });
    context.subscriptions.push(gitHistoryView);

    const resetHistoryView = vscode.window.createTreeView('resetHistoryPanel', {
        treeDataProvider: new ResetHistoryDataProvider(),
        showCollapseAll: true,
    });
    context.subscriptions.push(resetHistoryView);
}

class GitLogDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    async getTreeItem(element: vscode.TreeItem): Promise<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            // Fetch the git log and map it to TreeItems
            try {
                const gitLog = await GitLogViewer.getGitLog();
                if (gitLog.length > 0) {
                    const commits = gitLog.map(commit => {
                        return new vscode.TreeItem(`${commit.hash} - ${commit.date} - ${commit.message}`);
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
        } else {
            return [];
        }
    }
}

class ResetHistoryDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    // Placeholder for reset history data provider logic
    // This should fetch and display the history of reset actions performed through the extension
    async getTreeItem(element: vscode.TreeItem): Promise<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        // Placeholder for fetching reset history data
        // For now, return an empty array
        return [];
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}