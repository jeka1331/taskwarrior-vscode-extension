import * as vscode from 'vscode';
import * as fs from 'fs';
import { execSync } from "child_process";
import * as path from 'path';

export class TaskwarriorTaskProvider implements vscode.TreeDataProvider<Task> {

	private _onDidChangeTreeData: vscode.EventEmitter<Task | undefined | void> = new vscode.EventEmitter<Task | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Task | undefined | void> = this._onDidChangeTreeData.event;
	// constructor(private workspaceRoot: string | undefined) {
	// }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Task): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Task): Thenable<Task[]> {

		if (element) {
			// Это в случае, если есть вложенность у задачи (пока их нет)
			return Promise.resolve(this.getTasks());
		} else {
			return Promise.resolve(this.getTasks());
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getTasks(): Task[] {
		

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
