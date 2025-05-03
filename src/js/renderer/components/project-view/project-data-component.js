import { BaseComponent } from "../base/base-component";

const eventBus = require("js-event-bus")();

export class ProjectDataComponent extends BaseComponent {
    constructor(selector, api, undoRedoManager) {
        super(selector, api, undoRedoManager);
        eventBus.on("projectViewNodeSelected", this.onProjectViewNodeSelected.bind(this));
        eventBus.on("dataOpened", this.onDataOpened.bind(this));
    }

    static stringToArray(newValue) {
        return newValue && newValue.split(",").map(x => x.trim());//.filter(x => x);
    }

    shouldRenderOnProjectViewNodeSelected(arg) {
        throw new Error("Method must be implemented in subclasses.");
    }

    shouldHandleReset(data) {
        return true;
    }

    onDataOpened({ projectData }) {
        this.projectData = projectData;
    }

    resetProjectDataProvider({ nodeData }) {
        this.resetProvider(this.getDataForProvider(
            {
                projectData: this.projectData,
                name: nodeData.name
            }));
    }

    getDataForProvider(arg) {
        throw new Error("Method 'getDataForProvider' must be implemented in subclasses.");
    }

    onProjectViewNodeSelected({ node }) {
        if (this.shouldRenderOnProjectViewNodeSelected({ nodeData: node.data })) {
            this.resetProjectDataProvider(
                {
                    projectData: this.projectData,
                    nodeData: node.data
                });
        }
    }
}