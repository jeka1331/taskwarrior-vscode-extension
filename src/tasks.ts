import vscode = require( "vscode");
import * as fs from "fs";
import { execSync } from "child_process";
import * as path from "path";
import { TaskwarriorLib , Task as TaskFromLib} from "taskwarrior-lib";
import _ = require('underscore');

export class TaskwarriorTaskProvider implements vscode.TreeDataProvider<Task> {
  private _onDidChangeTreeData: vscode.EventEmitter<Task | undefined | void> =
    new vscode.EventEmitter<Task | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Task | undefined | void> =
    this._onDidChangeTreeData.event;


  constructor(
    private _status?: string 
  ) {
    this._status = _status ? _status : "pending";
  }
  
  public set status(v : string) {
    this._status = v;
  }

  
  public get status() : string {
    return this._status ? this._status : "pending";
  }
  
  

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Task): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Task): Thenable<Task[]> {
    if (element) {
      // Это в случае, если есть вложенность у задачи (пока их нет)
      return Promise.resolve(this.getTasksLib());
    } else {
      return Promise.resolve(this.getTasksLib());
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getTasksBin(): Task[] {
    
    const taskwarriorTasks: Task[] = [];
    if (this.pathExists(Task.TaskBinPath())) {
      try {
        let result = execSync(`${Task.TaskBinPath()} export`).toString();
        console.log(result);
        
        if (process.platform === 'win32') {
          result = "[" + result.split("\n").join(",").slice(0, -1) + "]";
        }
        // console.log(result);
        const taskData = JSON.parse(result.toString(), (key, value) => {
          return value;
        });

        taskData.forEach((task: { description: string; id: string ; uuid: string}) => {
          taskwarriorTasks.push(
            new Task(
              task.description,
              task.id,
              vscode.TreeItemCollapsibleState.None,
              task.uuid
            )
          );
        });
        // console.log(taskwarriorTasks);
      } catch (error) {
        console.error(`exec error: ${error}`);
        return [];
      }
    }

    // console.log(taskwarriorTasks);
    return taskwarriorTasks;
  }

  private getTasksLib(): Task[] {
    try {
      const taskwarriorTasks: Task[] = [];
      const taskwarrior = new TaskwarriorLib();
      const result = taskwarrior.load();

      result.forEach((value) => {
        taskwarriorTasks.push(
          new Task(
            value.description || "Missing UUID",
            value.id?.toString() || "Missing UUID",
            vscode.TreeItemCollapsibleState.None,
            value.uuid || "Missing UUID"

          )
        );
      });
      // console.log(taskwarriorTasks[0].getTaskForEdit());
      return taskwarriorTasks;
    } catch (error) {
      vscode.window.showErrorMessage('Could not fetch tasks!');
      return [];
    }
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
  public static TaskBinPath() : string  {
    let taskBinPath = "";
    switch (process.platform) {
      case "win32":
        taskBinPath = vscode.workspace.getConfiguration('taskwarrior').get('win32binpath').toString();
    }
    if (!taskBinPath) {
      taskBinPath = "/usr/bin/task";
    }
    return taskBinPath;
  }

  public static NewNode() : any {
    // description	String
    // project	String
    // priority	String
    // tags *	String
    // annotation *	String
    const task : TaskFromLib = {
      description: "Sample task",
      annotations: []
    };
    (new TaskwarriorLib).update([task]);
    vscode.commands.executeCommand('taskwarriorTasks.refreshEntry');
  }

  constructor(
    
    public readonly label: string,
    public readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly uuid: string,
    public readonly command?: vscode.Command,
  ) {
    super(label, collapsibleState);
    
    this.tooltip = uuid;
    this.description = this.version;
  }
  public getTaskForEdit(): string {
    const taskwarrior = new TaskwarriorLib();
    
    const result = JSON.stringify(taskwarrior.load(`uuid:${this.uuid}`)[0]);
    console.log();
    console.log(this.version);
    return result || "";
  }
  
  public delete(): string {
    
    const result = execSync(`${Task.TaskBinPath()} ${this.version} delete`).toString();
    
    // console.log(result);
    return result || "";
  }
  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      "task.svg"
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "dark",
      "task.svg"
    ),
  };

  contextValue = "dependency";
}
