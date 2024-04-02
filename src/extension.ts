import * as vscode from 'vscode';
import { GitLogViewer } from './gitLogViewer';
// Assuming performGitReset is adapted to perform a soft reset directly
import { performGitReset } from './gitReset';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vsc-git-history" is now active!');

    const gitLogDataProvider = new GitLogDataProvider();
    vscode.window.createTreeView('gitLogViewer', { treeDataProvider: gitLogDataProvider });

    context.subscriptions.push(vscode.commands.registerCommand('vsc-git-history.performGitReset', async (commitHash: string) => {
        // Show a confirmation dialog before proceeding
        const userChoice = await vscode.window.showWarningMessage(
            `Are you sure you want to soft reset to commit ${commitHash}? This will move the current HEAD to this commit but keep the working directory unchanged.`,
            { modal: true },
            'Confirm' // Only providing a positive confirmation option

        );

        if (userChoice === 'Confirm') {
            await performGitReset(commitHash).catch(error => {
                console.error('Failed to perform git reset:', error);
                vscode.window.showErrorMessage(`Failed to perform git reset. See console for details.`);
            });
        }
    }));

    if (vscode.workspace.workspaceFolders) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const gitRefsPathPattern = new vscode.RelativePattern(workspaceFolder, '.git/refs/**');
        const watcher = vscode.workspace.createFileSystemWatcher(gitRefsPathPattern, false, false, false);
        watcher.onDidChange(() => gitLogDataProvider.refresh());
        watcher.onDidCreate(() => gitLogDataProvider.refresh());
        watcher.onDidDelete(() => gitLogDataProvider.refresh());
        context.subscriptions.push(watcher);
    } else {
        console.log("No workspace folder found, cannot create FileSystemWatcher.");
    }

    let disposable = vscode.commands.registerCommand('vsc-git-history.viewGitHistory', async () => {
        // This will try to open and focus on your view container
        await vscode.commands.executeCommand('workbench.view.extension.vscGitHistory');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

class GitLogDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null> = new vscode.EventEmitter<vscode.TreeItem | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null> = this._onDidChangeTreeData.event;

    async getTreeItem(element: vscode.TreeItem): Promise<vscode.TreeItem> {
        return element;
    }

    // get the values in the tree element selected
    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            const gitLog = await GitLogViewer.getGitLog();
            return gitLog.map(log => {
                let item = new vscode.TreeItem(`${log.hash.substring(0, 7)} - ${log.date} - ${log.message}`, vscode.TreeItemCollapsibleState.None);
                item.tooltip = `Reset to ${log.hash}`;
                item.command = {
                    command: 'vsc-git-history.performGitReset',
                    title: "Perform Git Reset",
                    arguments: [log.hash]
                };
                return item;
            });
        } else {
            return [];
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(null);
    }
}
