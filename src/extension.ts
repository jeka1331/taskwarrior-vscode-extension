'use strict';

import * as vscode from 'vscode';

import { TaskwarriorTaskProvider, Task } from './tasks';

export function activate(context: vscode.ExtensionContext) {

	const nodeDependenciesProvider = new TaskwarriorTaskProvider();
	vscode.window.registerTreeDataProvider('taskwarriorTasks', nodeDependenciesProvider);
	vscode.commands.registerCommand('taskwarriorTasks.refreshEntry', () => nodeDependenciesProvider.refresh());
	// vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	vscode.commands.registerCommand('taskwarriorTasks.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
	vscode.commands.registerCommand('taskwarriorTasks.editEntry', (node: Task) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
	vscode.commands.registerCommand('taskwarriorTasks.deleteEntry', (node: Task) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));

	
}