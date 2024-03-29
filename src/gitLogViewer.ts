import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec);

interface GitCommit {
  hash: string;
  date: string;
  message: string;
}

export class GitLogViewer {
  static async getGitLog(): Promise<GitCommit[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No open workspace folder found.');
      console.error('No open workspace folder found.');
      return [];
    }

    const cwd = workspaceFolders[0].uri.fsPath;
    console.log(`Fetching git log for cwd: ${cwd}`);

    try {
      const { stdout } = await execAsync(
        `git log -g --pretty=format:"%h %gd - %s" --date=format:'%Y-%m-%d %H:%M:%S'`,
        { cwd }
      );
      console.log('Git reflog fetched successfully.');

      // Corrected parsing logic
      const commits = stdout.split('\n').filter(line => line.trim() !== '').map(line => {
        // Find the indices for the hash, date, and message
        const hashEndIndex = line.indexOf(' ');
        const messageStartIndex = line.lastIndexOf(' - ') + 3;

        if (hashEndIndex !== -1 && messageStartIndex > hashEndIndex) {
          const hash = line.substring(0, hashEndIndex);
          // Corrected extraction of date and time from the reflog entry
          const date = line.substring(hashEndIndex + 1, messageStartIndex - 3).replace('HEAD@{', '').replace('}', '');
          const message = line.substring(messageStartIndex);

          return { hash, date, message };
        }
        // Instead of returning null, ensure every line returns a valid object
        return { hash: "", date: "", message: "Parsing error" };
      });

      console.log(`Parsed ${commits.length} commits from git reflog.`);
      return commits as GitCommit[];
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to execute git reflog. Make sure you have git installed and the open folder is a git repository.'
      );
      console.error('Failed to execute git reflog:', error);
      return [];
    }
  }
}
