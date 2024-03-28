import * as vscode from 'vscode';
import { GitLogViewer } from './gitLogViewer';

export class GitLogViewerUI {
    private static panel: vscode.WebviewPanel | undefined;

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
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });

            this.panel.webview.html = await this.getWebviewContent();

            // Listen for when the panel becomes visible
            this.panel.onDidChangeViewState(e => {
                if (e.webviewPanel.visible) {
                    this.refreshGitLog();
                }
            });
        }
    }

    private static async getWebviewContent(): Promise<string> {
        const gitLog = await GitLogViewer.getGitLog();
        const logListItems = gitLog.map(commit => `<li>${commit.hash} - ${commit.date} - ${commit.message}</li>`).join('');
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Git Log Viewer</title>
            </head>
            <body>
                <h1>Git Log</h1>
                <ul>${logListItems}</ul>
            </body>
            </html>
        `;
    }

    public static async refreshGitLog() {
        if (this.panel) {
            this.panel.webview.html = await this.getWebviewContent();
        }
    }
}