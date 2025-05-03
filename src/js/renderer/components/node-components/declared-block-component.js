import { BaseNodeComponent } from "./base-node-component"
import { DeclaredBlockDataProvider } from "../providers/declared-block-data-provider";
import BlockUtils from "../../common/block-utils";
import { BlockResolvingMapDataProvider } from "../providers/block-resolving-map-data-provider";
import * as d3 from "d3";

const eventBus = require("js-event-bus")();

export class DeclaredBlockComponent extends BaseNodeComponent {
    #lastRenderedBlock;
    constructor(selector, causalView, api, undoRedoManager, causalBundleProvider, causesChangeManager) {
        super(selector, causalView, api, undoRedoManager);
        this.causalBundleProvider = causalBundleProvider;
        this.causesChangeManager = causesChangeManager;

        this.blockResolvingMapDataProvider = new BlockResolvingMapDataProvider(undoRedoManager);

        eventBus.on("dataOpened", this.onDataOpened.bind(this));
    }

    init() {
        super.init();
        this.setupResetByDataProviderEvents(this.blockResolvingMapDataProvider);
    }

    onDataOpened({ projectData }) {
        this.blockResolvingMapDataProvider.set(projectData);
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

    changeResolvedModel({ propertyName, newValue }) {
        console.log(propertyName, newValue, this.blockResolvingMapDataProvider);
    }

    // Works for convention and causes convention switching
    switchConvention(
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
            isReadonly: true,
            propName: "convention",
            isInnerProp: true,
            optionValues: this.causalBundleProvider.blockConventions.map(x => x.name),
            overrideInputHandling: this.switchConvention.bind(
                this,
                "blockConsequencesMap")
        });

        this.#appendSelectItem({
            name: "Block Causes Convention",
            inputId: "block-causes-convention-input",
            isReadonly: false,
            propName: "causesConvention",
            isInnerProp: true,
            optionValues: this.causalBundleProvider.blockCausesConventions.map(x => x.name),
            overrideInputHandling: this.switchConvention.bind(
                this,
                "blockCausesMap")
        });

        const causalModelNames = this.causalBundleProvider.causalModels.map(x => x.name);

        const declaredBlockId = this.nodeDataProvider.getBlock().id;
        const currentResolvedModelValue = this
            .blockResolvingMapDataProvider
            .getResolvingMap()
            .modelNamesByDeclaredBlockId[declaredBlockId]
            ?? null;
        this.#appendSelectItem({
            name: "Resolved Model",
            inputId: "resolved-model-name-input",
            isReadonly: false,
            // Seems like browser handles 'null' for select option in some specific
            // way, so we use empty string as a marker of 'dynamic' resolving
            optionValues: ["", ...causalModelNames],
            optionTexts: [this.#getDynamicOptionText(), ...causalModelNames],
            overrideInputHandling: this.changeResolvedModel.bind(this)
        }).on("input", (event) => {
            // "" -> null
            const selectedValue = d3.select(event.target).property("value") || null;
            this.blockResolvingMapDataProvider.changeModelNameByDeclaredBlockId(
                declaredBlockId,
                selectedValue
            );
        }).property("value", currentResolvedModelValue);

        this.nodeDataProvider.addEventListener(
            "property-changed",
            this.handlePropertyChanged.bind(this));
    }

    #getBlockCauseNames(causesConventionName) {
        return BlockUtils.getBlockCauseNames(
            this.causalBundleProvider.blockCausesConventions,
            causesConventionName
        );
    }

    #getBlockConsequenceNames(conventionName) {
        return BlockUtils.getBlockConsequenceNames(
            this.causalBundleProvider.blockConventions,
            conventionName
        );
    }

    #getDynamicOptionText() {
        if (this.causalBundleProvider.causalModels.length === 0) {
            return "[Dynamic]";
        }

        const defaultMainModelName = this.causalBundleProvider.defaultMainModel;
        if (defaultMainModelName === defaultMainModelName.toUpperCase()) {
            return "[DYNAMIC]";
        } else if (defaultMainModelName === defaultMainModelName.toLowerCase()) {
            return "[dynamic]";
        }
        return "[Dynamic]";
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
            optionTexts
        } = args;

        return this.appendInputItemCore(inputItem => {
            const select = inputItem
                .append("select")
                .attr("class", "input-item__input");
            if (isReadonly) {
                select.attr("disabled", true);
            }

            for (let i = 0; i < optionValues.length; i++) {
                const optionValue = optionValues[i];
                const optionText = (optionTexts && optionTexts[i]) ?? optionValue;
                select.append("option")
                    .attr("value", optionValue)
                    .text(optionText);
            }

            return select;
        }, args);
    }
}
