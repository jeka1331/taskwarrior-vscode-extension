import * as vscode from 'vscode';
import * as fs from 'fs';
import { exec, execFile, execSync, fork, spawn } from "child_process";
import * as path from 'path';

export class TaskwarriorTaskProvider implements vscode.TreeDataProvider<Task> {

	private _onDidChangeTreeData: vscode.EventEmitter<Task | undefined | void> = new vscode.EventEmitter<Task | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Task | undefined | void> = this._onDidChangeTreeData.event;
	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Task): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Task): Thenable<Task[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no package.json');
				return Promise.resolve([]);
			}
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): Task[] {
		

		const taskBinPath = '/usr/bin/task';
		let _tasks: Task[] = [];
		if (this.pathExists(taskBinPath)) {
			try{
				const result  = execSync(`${taskBinPath} export`);

				const taskData = JSON.parse(result.toString(), (key, value) => {
					return value;
				});

				const tasks: Task[] = [];
				taskData.forEach((task: { description: string; id: string; }) => {
					tasks.push(new Task(task.description, task.id, vscode.TreeItemCollapsibleState.None));
				});
				console.log(tasks);
				_tasks = tasks;
			} catch(error){
				
				console.error(`exec error: ${error}`);
				return [];
			
			}
		}



		// return deps.concat(devDeps);
		console.log(_tasks);
		return _tasks;
		



		// const taskBinPath = '/usr/bin/task';
		// if (this.pathExists(taskBinPath)) {
		// 	exec(`${taskBinPath} export`, (error, stdout) => {
		// 		if (error) {
		// 			console.error(`exec error: ${error}`);
		// 			return;
		// 		}
		// 		const taskData = JSON.parse(stdout, (key, value) => {
		// 			return value;
		// 		});

		// 		const tasks: Task[] = [];
		// 		taskData.forEach((task: { description: string; id: string; }) => {
		// 			tasks.push(new Task(task.description, task.id, vscode.TreeItemCollapsibleState.None));
		// 		});
		// 		console.log(tasks);
		// 		return tasks;

		// 	});
		// }
		// return [];




	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class Task extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}
