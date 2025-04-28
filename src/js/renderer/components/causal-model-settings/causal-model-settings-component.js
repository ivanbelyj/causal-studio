import { ProjectDataComponent } from "../convention-components/project-data-component";
import { causalModelNodeType } from "../project-view/js-tree-data-utils";
import { DataProvider } from "../providers/data-provider";

export class CausalModelSettingsComponent extends ProjectDataComponent {
    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === causalModelNodeType
            && !arg.nodeData.isRoot;
    }

    render(data) {
        this.appendTextInputItem({
            name: "Causal Model Name",
            inputId: "causal-model-name",
            propName: "name",
            isInnerProp: false,
            isReadonly: true
        });

        this.appendTextInputItem({
            name: "Fact Value Template",
            inputId: "fact-value-template",
            propName: "factValueTemplate",
            isInnerProp: false,
            useTextArea: true
        });
    }

    getDataForProvider({ projectData, name }) {
        return projectData.causalModels.find(x => x.name === name);
    }

    createDataProvider() {
        return new DataProvider(this.undoRedoManager);
    }
}
