import { BaseCausesComponent } from "./base-causes-component";
import { SelectNodeElement } from "../../elements/select-node-element";
import BlockUtils from "../../common/block-utils";
import { DeclaredBlockDataProvider } from "../../data/providers/declared-block-data-provider";

const eventBus = require("js-event-bus")();

export class BlockCausesComponent extends BaseCausesComponent {
    #lastRenderedBlock;
    constructor(
        selector,
        causalView,
        api,
        undoRedoManager,
        causesChangeManager,
        blockConventionsProvider) {
        super(selector, causalView, api, undoRedoManager, causesChangeManager, blockConventionsProvider);
        this.declaredBlockDataProvider = new DeclaredBlockDataProvider(
            this.undoRedoManager,
            this.causesChangeManager);
        this.declaredBlockDataProvider.addEventListener(
            "mutated",
            () => this.reset(this.declaredBlockDataProvider.get()));

        eventBus.on(
            "blockCausesConventionChanged",
            this.onNodeBlockCausesConventionChanged.bind(this));
    }

    onNodeBlockCausesConventionChanged({ blockId, newValue }) {
        if (this.#lastRenderedBlock.id === blockId) {
            this.reset(this.declaredBlockDataProvider.get())
        }
    }

    shouldHandleReset(nodeData) {
        return !!(nodeData.block);
    }

    render(nodeData) {
        this.#lastRenderedBlock = nodeData.block;

        const blockCauses = this.#getBlockCauseNames(nodeData.block.causesConvention);

        for (const blockCauseName of blockCauses) {
            this.#addSelectNodeItem(
                this.content,
                blockCauseName,
                nodeData.block.blockCausesMap[blockCauseName]);
        }

        this.declaredBlockDataProvider.set(nodeData);
    }

    #getBlockCauseNames(causesConventionName) {
        return BlockUtils.getBlockCauseNames(
            this.blockConventionsProvider.blockCausesConventions,
            causesConventionName
        );
    }

    #addSelectNodeItem(selection, blockCauseName, initialId) {
        selection
            .append("label")
            .attr("class", "input-item__label")
            .text(blockCauseName);

        new SelectNodeElement(
            selection.append("div").node(),
            this.causalView,
            this.blockConventionsProvider,
            (newCauseId) => {
                this.declaredBlockDataProvider.changeBlockCause(
                    blockCauseName,
                    newCauseId);
            },
            ({ blockId, blockConsequenceName }) => {
                this.declaredBlockDataProvider.changeBlockCause(
                    blockCauseName,
                    // TODO: update block reference mappings
                    BlockUtils.createCauseIdByBlockConsequence(blockId, blockConsequenceName));
            }
        ).init(initialId);
    }
}