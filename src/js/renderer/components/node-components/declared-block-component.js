import { BaseNodeComponent } from "./base-node-component"
import { DeclaredBlockDataProvider } from "../providers/declared-block-data-provider";

export class DeclaredBlockComponent extends BaseNodeComponent {
    constructor(selector, causalView, api, undoRedoManager, blockConventionsProvider) {
        super(selector, causalView, api, undoRedoManager);
        this.blockConventionsProvider = blockConventionsProvider;
    }

    renderNode(nodeData) {
        if (nodeData.block) {
            this.#renderBlockNode(nodeData.block);
        } else {
            console.warn("Unsupported node type for DeclaredBlockComponent.");
        }
    }

    shouldHandleReset(nodeData) {
        return !!(nodeData?.block);
    }

    createNodeDataProvider() {
        return new DeclaredBlockDataProvider(this.undoRedoManager, null)
    }

    #renderBlockNode() {
        this.titleInput = this.appendTextInputItem({
            name: "Title",
            propName: "title",
            inputId: "node-title-input",
            dontShowLabel: true,
            isInnerProp: false,
        });

        this.appendTextInputItem({
            name: "Declared Block Id",
            inputId: "block-id-input",
            isReadonly: true,
            propName: "id",
            isInnerProp: true,
        });

        this.#appendSelectItem({
            name: "Block Convention",
            inputId: "block-convention-input",
            isReadonly: false,
            propName: "convention",
            isInnerProp: true,
            optionValues: this.blockConventionsProvider.blockConventions.map(x => x.name),
        });

        this.#appendSelectItem({
            name: "Block Causes Convention",
            inputId: "block-causes-convention-input",
            isReadonly: false,
            propName: "causesConvention",
            isInnerProp: true,
            optionValues: this.blockConventionsProvider.blockCausesConventions.map(x => x.name),
        });
    }

    #appendSelectItem(args) {
        const {
            name,
            inputId,
            isReadonly,
            dontShowLabel,
            propName,
            isInnerProp,
            optionValues
        } = args;

        return this.appendInputItemCore(inputItem => {
            const select = inputItem
                .append("select")
                .attr("class", "input-item__input");

            for (const optionValue of optionValues) {
                select.append("option")
                    .attr("value", optionValue)
                    .text(optionValue);
            }

            return select;
        }, args);
    }
}
