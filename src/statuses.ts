import vscode = require("vscode");
import * as fs from "fs";
import { execSync } from "child_process";
import * as path from "path";
import { TaskwarriorLib } from "taskwarrior-lib";
import _ = require("underscore");

export class TaskwarriorStatusProvider
  implements vscode.TreeDataProvider<Status>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Status | undefined | void> =
    new vscode.EventEmitter<Status | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Status | undefined | void> =
    this._onDidChangeTreeData.event;
  // constructor(private workspaceRoot: string | undefined) {
  // }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Status): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Status): Thenable<Status[]> {
    if (element) {
      // Это в случае, если есть вложенность у задачи (пока их нет)
      return Promise.resolve([
        new Status("1", "1", vscode.TreeItemCollapsibleState.None, "pending.svg"),
      ]);
    } else {
      return Promise.resolve([
        new Status("Pending", "1", vscode.TreeItemCollapsibleState.None, "pending.svg"),
        new Status("Completed", "1", vscode.TreeItemCollapsibleState.None, "completed.svg"),
        new Status("Waiting", "1", vscode.TreeItemCollapsibleState.None, "pending.svg"),
        new Status("Deleted ", "1", vscode.TreeItemCollapsibleState.None, "pending.svg"),
        new Status("Recurring", "1", vscode.TreeItemCollapsibleState.None, "dependency.svg"),
      ]);
    }
  }
}

export class Status extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly icon: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = "Set status";
    // this.description = this.version;
  }
  // iconPath = {
  //   light: path.join(__filename, "..", "..", "resources", "light", this.icon),
  //   dark: path.join(__filename, "..", "..", "resources", "dark", this.icon),
  // };

  contextValue = "dependency";
}
