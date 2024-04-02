# VSC Git History README

Welcome to the "Oinki Git History" extension for Visual Studio Code! This extension enhances your Git experience within Visual Studio Code by providing a view of your repository's commit history and allowing you to perform soft resets to specific commits directly from the IDE.

## Features

- **Git Log Viewer:** View a formatted git log within a dedicated panel in Visual Studio Code. The log displays commit hashes, dates, and messages in an easily accessible format.
- **Commit Selection for Reset:** Easily select a commit from the log and choose to perform either a soft or hard reset.
- **Safety Mechanisms for Hard Reset:** Before performing a soft reset, the extension will prompt you for confirmation to prevent accidental loss of work.
- **Reset History Logging:** Keep track of all reset actions performed through the extension, including the commit hash and timestamp.

## Installation

This extension can be installed directly from the Visual Studio Code Marketplace. Search for "Oinki Git History" in the Extensions view (`Ctrl+Shift+X`) and click Install.

## Usage

1. Open a repository in Visual Studio Code.
2. Access the Git Log Viewer through the "Git History" icon in the activity bar or by using the command palette (`Ctrl+Shift+P`) and typing "View Git Log".
3. In the Git Log Viewer panel, click on any commit to see reset options.
4. Choose between a soft reset or a hard reset. If you select a hard reset, a confirmation dialog will appear.
5. View the history of resets performed through the extension by accessing the "Reset History" panel.

## Requirements

- Visual Studio Code version 1.87.0 or higher.
- Git must be installed on your system and available in your PATH.

## Extension Settings

This extension does not contribute any specific settings at the moment.

## Known Issues

No known issues at this time. If you encounter any problems, please open an issue on the GitHub repository.

## Release Notes

### 1.0.0

- Initial release of Oinki Git History.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

## License

This extension is released under the MIT License. See the LICENSE file for more details.

## For more information

- [Repository] (https://github.com/Oinki-Software/VSG_Git_History.git)
- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy using Oinki Git History!**