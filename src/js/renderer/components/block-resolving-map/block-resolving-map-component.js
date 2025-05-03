import { ProjectDataComponent } from "../convention-components/project-data-component";
import { blockResolvingMapNodeType } from "../project-view/js-tree-data-utils";
import { BlockResolvingMapDataProvider } from "../providers/block-resolving-map-data-provider";

export class BlockResolvingMapComponent extends ProjectDataComponent {
    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === blockResolvingMapNodeType
            && arg.nodeData.isRoot;
    }

    render(data) {
        for (const convention of this.projectData.blockConventions) {
            // this.appendLabel(convention.name);
            this.appendTextInputItem({
                name: convention.name,
                inputId: "test",
                propName: convention.name,
                isInnerProp: true,
                isReadonly: false
            });
        }
    }

    appendLabel(labelText) {
        this.component
            .append("label")
            .attr("class", "input-item__label")
            .text(labelText);
    }

    getDataForProvider({ projectData, name }) {
        return projectData;
    }

    // 1. 
    // resolvingMap is a part of project data.
    // resolvingMap contains:
    // modelNamesByConventionName, modelNamesByDeclaredBlockId

    createDataProvider() {
        return new BlockResolvingMapDataProvider(this.undoRedoManager);
    }
}
