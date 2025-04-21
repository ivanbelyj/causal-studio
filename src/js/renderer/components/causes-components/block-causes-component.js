import { BaseCausesComponent } from "./base-causes-component";
import { SelectNodeElement } from "../../elements/select-node-element";
import { DeclaredBlockDataProvider } from "../providers/declared-block-data-provider";

export class BlockCausesComponent extends BaseCausesComponent {
    constructor(
        selector,
        causalView,
        api,
        undoRedoManager,
        causesChangeManager,
        blockConventionsProvider) {
        super(selector, causalView, api, undoRedoManager, causesChangeManager);
        this.blockConventionsProvider = blockConventionsProvider;
        this.declaredBlockDataProvider = new DeclaredBlockDataProvider(
            this.undoRedoManager,
            this.causesChangeManager);
        this.declaredBlockDataProvider.addEventListener(
            "mutated",
            () => this.reset(this.declaredBlockDataProvider.get()));
    }

    shouldHandleReset(nodeData) {
        return !!(nodeData.block);
    }

    render(nodeData) {
        const blockCauses = this.#getBlockCauseNames("TestCausesConvention");

        for (const blockCauseName of blockCauses) {
            this.#addSelectNodeItem(
                this.content,
                blockCauseName,
                nodeData.block.blockCausesMap[blockCauseName]);
        }

        this.declaredBlockDataProvider.set(nodeData);
    }

    #getBlockCauseNames(causesConventionName) {
        const blockCauses = this
            .blockConventionsProvider
            .blockCausesConventions
            .find(x => x.name === causesConventionName)
            ?.causes;
        return blockCauses ?? [];
    }

    #addSelectNodeItem(selection, blockCauseName, initialId) {
        selection
            .append("label")
            .attr("class", "input-item__label")
            .text(blockCauseName);

        new SelectNodeElement(
            selection.append("div").node(),
            this.causalView,
            (newCauseId) => {
                this.declaredBlockDataProvider.changeBlockCause(
                    blockCauseName,
                    newCauseId);
            }
        ).init(initialId);
    }
}