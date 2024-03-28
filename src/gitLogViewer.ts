import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec);

export class GitLogViewer {
  static async getGitLog(): Promise<string> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No open workspace folder found.');
      console.error('No open workspace folder found.');
      return '';
    }

    const cwd = workspaceFolders[0].uri.fsPath;

    try {
      const { stdout } = await execAsync(
        `git log --date-order --pretty=format:"%h %ad - %s" --date=format:"%a %b %d %H:%M:%S %Y"`,
        { cwd }
      );
      console.log('Git log fetched successfully.');
      return stdout;
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to execute git log. Make sure you have git installed and the open folder is a git repository.'
      );
      console.error('Failed to execute git log:', error);
      return '';
    }
  }
}