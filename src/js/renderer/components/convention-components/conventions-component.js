import { blockConventionNodeType } from "../project-view/js-tree-data-utils";
import { BaseConventionsComponent } from "./base-conventions-component";

export class ConventionsComponent extends BaseConventionsComponent {
    shouldRenderOnProjectViewNodeSelected(arg) {
        return arg.nodeData.type === blockConventionNodeType
            && !arg.nodeData.isRoot;
    }

    render(data) {
        const current = data?.consequences || [];

        this.renderCommonInputs({
            nameInputId: "convention-name",
            nameLabel: "Convention Name",
            itemLabel: "Consequence",
            initialItems: current,
            onAdd: (newItem) => this.dataProvider.addConsequence(newItem),
            onRemove: (itemToRemove) => this.dataProvider.removeConsequence(itemToRemove)
        });
    }

    getDataForProvider({ projectData, name }) {
        return projectData.blockConventions.find(x => x.name === name);
    }
}