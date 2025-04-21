import { blockCausesConventionNodeType } from "../project-view/js-tree-data-utils";
import { CausesConventionDataProvider } from "../providers/causes-convention-data-provider";
import { ProjectDataComponent } from "./project-data-component";

export class CausesConventionsComponent extends ProjectDataComponent {
    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === blockCausesConventionNodeType
            && !arg.nodeData.isRoot;
    }

    render(data) {
        this.appendTextInputItem({
            name: "Causes Convention Name",
            inputId: "convention-name",
            propName: "name",
            isInnerProp: false,
        });

        this.appendTextInputItem({
            name: "Causes",
            inputId: "causes",
            propName: "causes",
            isInnerProp: false,
            useTextArea: true,
            processValueBeforeSet: ProjectDataComponent.stringToArray
        });
    }

    getDataForProvider({ projectData, name }) {
        return projectData.blockCausesConventions.find(x => x.name === name);
    }

    createDataProvider() {
        return new CausesConventionDataProvider(this.undoRedoManager);
    }
}
