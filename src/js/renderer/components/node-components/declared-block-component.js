import { BaseNodeComponent } from "./base-node-component"
import { DeclaredBlockDataProvider } from "../providers/declared-block-data-provider";
import BlockUtils from "../../common/block-utils";

const eventBus = require("js-event-bus")();

export class DeclaredBlockComponent extends BaseNodeComponent {
    #lastRenderedBlock;
    constructor(selector, causalView, api, undoRedoManager, blockConventionsProvider, causesChangeManager) {
        super(selector, causalView, api, undoRedoManager);
        this.blockConventionsProvider = blockConventionsProvider;
        this.causesChangeManager = causesChangeManager;
    }

    renderNode(nodeData) {
        if (nodeData.block) {
            this.#lastRenderedBlock = nodeData.block;
            this.#renderBlockNode(nodeData.block);
        } else {
            console.warn("Unsupported node type for DeclaredBlockComponent.");
        }
    }

    shouldHandleReset(nodeData) {
        return !!(nodeData?.block);
    }

    createNodeDataProvider() {
        return new DeclaredBlockDataProvider(this.undoRedoManager, this.causesChangeManager)
    }

    handlePropertyChanged({ propertyName, newValue: propertyValue }) {
        if (propertyName === "convention") {
            eventBus.emit("blockConventionChanged", null, {
                blockId: this.#lastRenderedBlock.id,
                newValue: propertyValue
            });
        }
        else if (propertyName === "causesConvention") {
            eventBus.emit("blockCausesConventionChanged", null, {
                blockId: this.#lastRenderedBlock.id,
                newValue: propertyValue
            });
        }
    }

    #getBlockCauseNames(causesConventionName) {
        return BlockUtils.getBlockCauseNames(
            this.blockConventionsProvider.blockCausesConventions,
            causesConventionName
        );
    }

    #getBlockConsequenceNames(conventionName) {
        return BlockUtils.getBlockConsequenceNames(
            this.blockConventionsProvider.blockConventions,
            conventionName
        );
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
            overrideInputHandling: this.switchConvention.bind(
                this,
                this.#getBlockConsequenceNames.bind(this),
                "blockConsequencesMap")
        });

        this.#appendSelectItem({
            name: "Block Causes Convention",
            inputId: "block-causes-convention-input",
            isReadonly: false,
            propName: "causesConvention",
            isInnerProp: true,
            optionValues: this.blockConventionsProvider.blockCausesConventions.map(x => x.name),
            overrideInputHandling: this.switchConvention.bind(
                this,
                this.#getBlockCauseNames.bind(this),
                "blockCausesMap")
        });
        this.nodeDataProvider.addEventListener(
            "property-changed",
            this.handlePropertyChanged.bind(this));
    }

    // Works for convention and causes convention switching
    switchConvention(
        getBlockReferenceNames,
        referenceMapPropertyName,
        { propertyName, newValue }) {
        // We define custom input handling so changes weren't applied
        // to the actual data. Apply them
        this.nodeDataProvider.switchBlockReferences(
            {
                propertyName,
                referenceMapPropertyName,
                newValue,
                oldReferenceMap: this.nodeDataProvider.getBlock()[referenceMapPropertyName],
                newReferenceMap: {}
            }
        );
    }

    #appendSelectItem(args) {
        const {
            name,
            inputId,
            isReadonly,
            dontShowLabel,
            propName,
            isInnerProp,
            optionValues,
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
