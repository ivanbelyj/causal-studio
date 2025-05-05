import { DataProvider } from "../../data/providers/data-provider";
import { BaseNodeComponent } from "./base-node-component";

export class ExternalFactComponent extends BaseNodeComponent {
    shouldHandleReset(nodeData) {
        return !!(nodeData?.isExternal);
    }

    createDataProvider() {
        return new DataProvider(this.undoRedoManager);
    }

    render() {
        this.idInput = this.appendTextInputItem({
            name: "Id",
            propName: "id",
            inputId: "node-id-input",
            isReadonly: true,
            isInnerProp: false,
        });

        const infoItemParent = this.component
            .append("div")
            .classed("input-item", true);

        infoItemParent.append("div")
            .text("External cause")
            .style("font-weight", "bold")
            .style("margin-bottom", "0.5em");

        infoItemParent.append("div")
            .text(
                "Cause with the given id was not found in the current causal model, " +
                "so it is displayed as an external fact. Note that causal models " +
                "with external facts cannot be run itself - ensure that the parent " +
                "model, using the given model as a block, contains the fact with id " +
                "according to the external cause, and it was mapped for the block " +
                "in its declaration.")
            .style("color", "var(--disabled-text)");
    }
}