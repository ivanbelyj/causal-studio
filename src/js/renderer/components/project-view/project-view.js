import * as d3 from "d3";
import "../../../../third-party/jstree/themes/default/style.css";
import "../../../../third-party/jstree/themes/default-dark/style.css";
import "jstree";
import { JsTreeDataUtils } from "./js-tree-data-utils";
import { EventSendingProjectViewNodeHandler } from "./event-sending-project-view-node-handler";
import ProjectViewContextMenuManager from "./project-view-context-menu-manager";

const projectViewId = "#project-view";

export class ProjectView {
  constructor(selector, dataManager) {
    this.component = d3.select(selector);
    this.dataManager = dataManager;
  }

  init() {
    this.#initJsTree();
    this.nodeHandlers = [new EventSendingProjectViewNodeHandler()];

    this.contextMenuManager = new ProjectViewContextMenuManager(
      this.dataManager,
      () => {
        this.setProjectData(this.dataManager.projectData);
      });
  }

  setProjectData(projectData) {
    const jsTreeData = JsTreeDataUtils.projectDataToJsTreeData(projectData);
    console.log("js tree data", jsTreeData);
    this.reset(jsTreeData);
  }

  onJsTreeChanged(e, data) {
    const selectedNodesText = [];
    for (let i = 0; i < data.selected.length; i++) {
      const node = data.instance.get_node(data.selected[i]);

      this.#handleNodeSelect(data, node);

      selectedNodesText.push(node.text);
    }
    console.log("Selected: " + selectedNodesText.join(", "));
  }

  reset(treeData) {
    let instance = $(projectViewId).jstree(true);
    this.jsTreeInstance = instance;

    // set new data
    instance.settings.core.data = treeData;

    //important to refresh the tree, must set the second parameter to true
    instance.refresh(false, true);
  }

  #handleNodeSelect(data, node) {
    for (const nodeHandler of this.nodeHandlers) {
      nodeHandler.handleSelected(data.instance, node);
    }
  }

  #initJsTree() {
    this.component.append("div").attr("id", "project-view");

    $.jstree.defaults.core.themes.name = "default-dark";

    $(() => {
      const onJsTreeChanged = this.onJsTreeChanged.bind(this);
      $(projectViewId).on("changed.jstree", onJsTreeChanged);

      $(projectViewId).jstree({
        plugins: ["contextmenu"],
        core: {
          data: [],
          animation: 0,
          themes: {
            theme: "default-dark",
            icons: false,
          },
        },
        contextmenu: {
          items: (node) => this.contextMenuManager.getContextMenuItems(node),
          // items: this.contextMenuManager.getContextMenuItems.bind(this.contextMenuManager),
        },
      });
    });
  }
}
