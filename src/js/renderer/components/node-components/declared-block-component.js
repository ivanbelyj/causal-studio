import { BaseNodeComponent } from "./base-node-component"
import { DeclaredBlockDataProvider } from "../providers/declared-block-data-provider";
import BlockUtils from "../../common/block-utils";
import { BlockResolvingMapDataProvider } from "../providers/block-resolving-map-data-provider";
import * as d3 from "d3";
import BlockResolvingMapUtils from "../../common/block-resolving-map-utils";

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

    render(nodeData) {
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

    createDataProvider() {
        return new DeclaredBlockDataProvider(this.undoRedoManager, this.causesChangeManager);
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
        this.dataProvider.switchBlockReferences(
            {
                propertyName,
                referenceMapPropertyName,
                newValue,
                oldReferenceMap: this.dataProvider.getBlock()[referenceMapPropertyName],
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
            shouldRenderCausalView: true
        });

        this.appendTextInputItem({
            name: "Declared Block Id",
            inputId: "block-id-input",
            isReadonly: true,
            propName: "id",
            isInnerProp: true,
        });

        this.appendSelectItem({
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

        this.appendSelectItem({
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

        const declaredBlockId = this.dataProvider.getBlock().id;
        const currentResolvedModelValue = this
            .blockResolvingMapDataProvider
            .getResolvingMap()
            .modelNamesByDeclaredBlockId[declaredBlockId]
            ?? null;
        this.appendSelectItem({
            name: "Resolved Model",
            inputId: "resolved-model-name-input",
            isReadonly: false,
            ...BlockResolvingMapUtils.getBlockResolvingOptionValuesAndTexts(this.causalBundleProvider),
            overrideInputHandling: this.changeResolvedModel.bind(this)
        }).on("input", (event) => {
            // "" -> null
            const selectedValue = d3.select(event.target).property("value") || null;
            this.blockResolvingMapDataProvider.changeModelNameByDeclaredBlockId(
                declaredBlockId,
                selectedValue
            );
        }).property("value", currentResolvedModelValue);

        this.dataProvider.addEventListener(
            "property-changed",
            this.handlePropertyChanged.bind(this));
    }
}
