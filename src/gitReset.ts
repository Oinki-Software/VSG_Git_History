import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec);

export async function performGitRevertToCommitState(commitHash: string) {
    const cwd = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
    if (!cwd) {
        vscode.window.showErrorMessage('No open workspace folder found.');
        console.error('No open workspace folder found.');
        return;
    }

    try {
        // Step 1: Checkout the files from the specified commit
        const checkoutCommand = `git checkout ${commitHash} -- .`;
        const { stderr: checkoutStderr } = await execAsync(checkoutCommand, { cwd });
        if (checkoutStderr) {
            throw new Error(checkoutStderr);
        }

        // Step 2: Stage the changes
        const addCommand = `git add .`;
        const { stderr: addStderr } = await execAsync(addCommand, { cwd });
        if (addStderr) {
            throw new Error(addStderr);
        }

        // Step 3: Commit the changes
        const commitMessage = `Revert files to state at commit ${commitHash}`;
        const commitCommand = `git commit -m "${commitMessage}"`;
        const { stderr: commitStderr } = await execAsync(commitCommand, { cwd });
        if (commitStderr) {
            throw new Error(commitStderr);
        }

        vscode.window.showInformationMessage(`Successfully reverted files to state at commit ${commitHash} and created a new commit.`);
    } catch (error) {
        const errorMessage = (error as Error).message;
        vscode.window.showErrorMessage(`Failed to revert to commit ${commitHash}. See console for details.`);
        console.error(`Failed to execute git revert command: ${errorMessage}`, error);
    }
}