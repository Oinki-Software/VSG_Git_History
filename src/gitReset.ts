import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec);

export async function performGitReset(commitHash: string) {
    const cwd = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
    if (!cwd) {
        vscode.window.showErrorMessage('No open workspace folder found.');
        console.error('No open workspace folder found.');
        return;
    }

    //const resetCommand = `git reset --${gitResetOption} ${commitHash}`;
    const resetCommand = `git reset --soft ${commitHash}`;
    try {
        const { stdout, stderr } = await execAsync(resetCommand, { cwd });
        if (stderr) {
            throw new Error(stderr);
        }
        console.log(`Reset command executed successfully: ${stdout}`);
        vscode.window.showInformationMessage(`Successfully performed soft reset to commit ${commitHash}.`);
    } catch (error) {
        const errorMessage = (error as Error).message;
        vscode.window.showErrorMessage(`Failed to perform soft reset to commit ${commitHash}. See console for details.`);
        console.error(`Failed to execute git reset command: ${errorMessage}`, error);
    }
}