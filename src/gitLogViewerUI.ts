import * as vscode from 'vscode';
import { GitLogViewer } from './gitLogViewer';
import { performGitReset } from './gitReset';

// This class is responsible for showing the Git Log Viewer UI in a webview panel
export class GitLogViewerUI {
    private static panel: vscode.WebviewPanel | undefined;
    private static refreshIntervalId: NodeJS.Timeout | undefined;

    // This method is responsible for showing the Git Log Viewer UI in a webview panel
    public static async showGitLogPanel(context: vscode.ExtensionContext) {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'gitLogViewer',
                'Git Log Viewer',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
                if (this.refreshIntervalId) {
                    clearInterval(this.refreshIntervalId);
                    this.refreshIntervalId = undefined;
                }
            });

            this.panel.webview.onDidReceiveMessage(async message => {
                console.log('Message received from webview:', message); // Added log for debugging message reception
                switch (message.command) {
                    case 'reset':
                        await this.showResetOptions(message.commitHash);
                        break;
                    default:
                        console.error(`Unknown command received from webview: ${message.command}`);
                }
            }, undefined, context.subscriptions);

            this.panel.webview.html = await this.getWebviewContent();

            this.panel.onDidChangeViewState(e => {
                if (e.webviewPanel.visible) {
                    this.refreshGitLog();
                }
            });

            this.refreshIntervalId = setInterval(() => this.refreshGitLog(), 30000);
        }
    }
    // This method is responsible for showing the reset options for a selected commit
    private static async showResetOptions(commitHash: string) {
        console.log('Showing reset options for commit:', commitHash); // Added log for debugging reset options
        const resetType = await vscode.window.showQuickPick(['Soft Reset', 'Hard Reset'], {
            placeHolder: 'Choose reset type',
        });
        if (resetType) {
            await performGitReset(commitHash, resetType).catch(error => {
                console.error('Failed to perform git reset:', error);
                vscode.window.showErrorMessage(`Failed to perform git reset. See console for details.`);
            });
        } else {
            console.log(`Reset operation cancelled or failed for commit ${commitHash}.`);
        }
    }

    // This method is responsible for getting the webview content for the Git Log Viewer
    private static async getWebviewContent(): Promise<string> {
        const gitLog = await GitLogViewer.getGitLog();
        const logListItems = gitLog.map(commit => 
            `<li class="commit-item" data-commit-hash="${commit.hash}" style="cursor: pointer;">${commit.hash} - ${commit.date} - ${commit.message}</li>`
        ).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Git Log Viewer</title>
                <style>
                    .commit-item:hover {
                        background-color: lightgrey;
                    }
                </style>
            </head>
            <body>
                <h1>Git Log</h1>
                <ul id="gitLog">${logListItems}</ul>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('gitLog').addEventListener('click', function(event) {
                        let target = event.target;
                        while (target && target.tagName !== 'LI') {
                            target = target.parentElement;
                        }
                        if (target && target.classList.contains('commit-item')) {
                            console.log('Commit clicked:', target.dataset.commitHash); // Added log for debugging commit click
                            vscode.postMessage({
                                command: 'reset',
                                commitHash: target.dataset.commitHash
                            });
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    public static async refreshGitLog() {
        if (this.panel) {
            this.panel.webview.html = await this.getWebviewContent().catch(error => {
                console.error('Failed to refresh git log:', error);
                vscode.window.showErrorMessage('Failed to refresh git log. See console for details.');
                return 'Failed to load git log.';
            });
        }
    }
}