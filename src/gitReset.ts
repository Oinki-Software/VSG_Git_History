import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec);

export async function performGitReset(commitHash: string, resetType: string) {
    const cwd = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
    if (!cwd) {
        vscode.window.showErrorMessage('No open workspace folder found.');
        console.error('No open workspace folder found.');
        return;
    }

    let resetCommand = '';
    switch (resetType) {
        case 'Soft Reset':
            resetCommand = `git reset --soft ${commitHash}`;
            break;
        case 'Hard Reset':
            resetCommand = `git reset --hard ${commitHash}`;
            break;
        default:
            vscode.window.showErrorMessage('Invalid reset type selected.');
            console.error('Invalid reset type selected.');
            return;
    }

    try {
        const { stdout, stderr } = await execAsync(resetCommand, { cwd });
        console.log(`Reset command executed successfully: ${stdout}`);
        vscode.window.showInformationMessage(`Successfully performed ${resetType} to commit ${commitHash}.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to perform ${resetType} to commit ${commitHash}. See console for details.`);
        console.error(`Failed to execute git reset command: ${(error as any).message}`, error);
    }
}