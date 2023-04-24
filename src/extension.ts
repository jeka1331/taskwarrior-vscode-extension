

import { execSync } from "child_process";
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";
import { tmpdir } from "os";

import { TaskwarriorTaskProvider, Task } from "./tasks";
import { SettingsEditorProvider } from './settingsEditorProvider';

import {Uri} from "vscode";
import {
  setContext,
  setDocument,
  reopenWith,
  getFileHandler,
  setTextEditor,
} from './util';

export function activate(context: vscode.ExtensionContext) {
  const taskwarriorTaskProvider = new TaskwarriorTaskProvider();
  vscode.window.registerTreeDataProvider(
    "taskwarriorTasks",
    taskwarriorTaskProvider
  );
  vscode.commands.registerCommand("taskwarriorTasks.refreshEntry", () =>
  taskwarriorTaskProvider.refresh()
  );
  vscode.commands.registerCommand("taskwarriorTasks.addEntry", () =>
    vscode.window.showInformationMessage(`Successfully called add entry.`)
  );
  vscode.commands.registerCommand("taskwarriorTasks.editEntry", async (node: Task) => {
      // console.log(node);
      // Create a unique file name with a ".tmp" extension
      const fileName = `temp-${Math.random()
        .toString(36)
        .substring(2, 8)}.task`;

      // Get the path to the OS's temporary folder
      const tempFolder = fs.mkdtempSync(`${tmpdir()}${path.sep}`);

      // Create the file in the temporary folder
      const filePath = path.join(tempFolder, fileName);
      fs.writeFileSync(filePath, node.getTaskForEdit());

      // Open the file in the editor
      // const document = await vscode.workspace.openTextDocument(filePath);
      // await vscode.window.showTextDocument(document);

      // vscode.workspace.onDidSaveTextDocument((document) => {
      //   vscode.window.showInformationMessage(`Saved ${document.getText()}`);
      // });

      await vscode.commands.executeCommand(
        "vscode.openWith",
        Uri.file(filePath),
        "default"
      );

      // execSync(`EDITOR="code -w" task edit ${node.version}`);
    }
  );
  vscode.commands.registerCommand("taskwarriorTasks.deleteEntry", async (node: Task) => {
      vscode.window.showInformationMessage(
        `Successfully called delete entry on ${node.version}.`,
        'Yes',
        'No'
      ).then(answer => {
        if (answer === "Yes") {
          vscode.window.showInformationMessage(node.delete());
        }
      });
    }
      
  );
  vscode.commands.registerCommand('settingsEditor.openEditor',
    () => reopenWith('settingsEditor.settingsedit')
  );
  vscode.commands.registerCommand('settingsEditor.openSource',
    () => reopenWith('default')
  );
  // context.subscriptions.push(openEditorCommand);
  // context.subscriptions.push(openSourceCommand);
  context.subscriptions.push(SettingsEditorProvider.register(context));
}
vscode.window.onDidChangeActiveTextEditor(updateOpenEditorButton);

async function updateOpenEditorButton(
  textEditor: vscode.TextEditor | undefined
) {
  const key = 'settingsEditor.openEditor';
  if (textEditor) {
    setTextEditor(textEditor);
    const document = textEditor.document;
    if (await getFileHandler(document)) {
      setDocument(document);
      setContext(key, true);
    } else {
      setContext(key, false);
    }
  } else {
    setContext(key, false);
  }
}

updateOpenEditorButton(vscode.window.activeTextEditor);