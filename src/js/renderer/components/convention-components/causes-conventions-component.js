import { blockCausesConventionNodeType } from "../project-view/js-tree-data-utils";
import { BaseConventionsComponent } from "./base-conventions-component";

export class CausesConventionsComponent extends BaseConventionsComponent {
    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === blockCausesConventionNodeType
            && !arg.nodeData.isRoot;
    }

    render(data) {
        const current = data?.causes || [];

        this.renderCommonInputs({
            nameInputId: "causes-convention-name",
            nameLabel: "Causes Convention Name",
            itemLabel: "Cause",
            initialItems: current,
            onAdd: (newItem) => this.dataProvider.addCause(newItem),
            onRemove: (itemToRemove) => this.dataProvider.removeCause(itemToRemove),
            isReadonly: true
        });
    }

    getDataForProvider({ projectData, name }) {
        return projectData.blockCausesConventions.find(x => x.name === name);
    }
}