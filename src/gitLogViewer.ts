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
      return [];
    }

    const cwd = workspaceFolders[0].uri.fsPath;

    try {
      const { stdout } = await execAsync(
        `git log -g --pretty=format:"%h %gd ||| %gs" --date=format:'%Y-%m-%d %H:%M:%S'`, { cwd }
      );

      const commits: GitCommit[] = stdout.split('\n')
        .filter(line => line.trim() !== '')
        .map((line): GitCommit => {
          // Split the line into parts, considering the format
          const parts = line.split(' ||| ', 2);
          console.log(`parts: ${parts}`);
          const message = parts[1];
          console.log(`message: ${message}`);
          const hashPart = parts[0].split(' ');
          const hash = hashPart[0];
          console.log(`hash: ${hash}`);
          console.log(`hashPart1: ${hashPart[1]}`);
          const stringdate = hashPart[1].slice(6, 16); // Extracts datetime, removing "HEAD@{" prefix and the trailing "}"
          const time = hashPart[2].slice(0, 8);
          console.log(`time: ${time}`);
          // Turn date string into a human-readable format ddd MMM dd  
          const date = formatDate(stringdate) + " " + time;
          console.log(`formattedDate: ${date}`);

          return {
            hash,
            date,
            message
          };
        });

      return commits;
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to execute git reflog. Make sure you have git installed and the open folder is a git repository.'
      );
      console.error('Failed to execute git reflog:', error);
      return [];
    }
  }
}

function formatDate(dateString: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const date = new Date(dateString);
  const dayName = days[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = months[date.getMonth()];

  return `${dayName} ${dayOfMonth} ${monthName}`;
}