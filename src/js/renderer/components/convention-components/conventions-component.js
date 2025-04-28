import { blockConventionNodeType } from "../project-view/js-tree-data-utils";
import { BlockConventionDataProvider } from "../providers/block-convention-data-provider";
import { ProjectDataComponent } from "./project-data-component";

export class ConventionsComponent extends ProjectDataComponent {
    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === blockConventionNodeType
            && !arg.nodeData.isRoot;
    }

    render(data) {
        this.appendTextInputItem({
            name: "Convention Name",
            inputId: "convention-name",
            propName: "name",
            isInnerProp: false,
            isReadonly: true
        });

        this.appendTextInputItem({
            name: "Consequences",
            inputId: "consequences",
            propName: "consequences",
            isInnerProp: false,
            useTextArea: true,
            processValueBeforeSet: ProjectDataComponent.stringToArray
        });
    }

    getDataForProvider({ projectData, name }) {
        return projectData.blockConventions.find(x => x.name === name);
    }

    createDataProvider() {
        return new BlockConventionDataProvider(this.undoRedoManager);
    }
}