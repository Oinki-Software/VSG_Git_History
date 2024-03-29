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

    try {
      const { stdout } = await execAsync(
        `git log --date-order --pretty=format:"%h %x1f %ad %x1f %s" --date=format:"%a %b %d %H:%M:%S"`,
        { cwd }
      );
      console.log('Git log fetched successfully.');

      const commits = stdout.split('\n').filter(line => line.trim() !== '').map(line => {
        const parts = line.split('\x1f');
        if (parts.length === 3) {
          const [hash, date, message] = parts;
          return { hash, date, message };
        }
        return null;
      }).filter(commit => commit !== null) as GitCommit[];

      console.log(`Parsed ${commits.length} commits from git log.`);
      return commits;
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to execute git log. Make sure you have git installed and the open folder is a git repository.'
      );
      console.error('Failed to execute git log:', error);
      return [];
    }
  }
}