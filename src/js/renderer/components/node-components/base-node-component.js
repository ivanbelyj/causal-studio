import * as d3 from "d3";

export class BaseNodeComponent {
    nodeDataProvider;
    constructor(selector, causalView, api, undoRedoManager) {
        this.selector = selector;
        this.component = d3.select(selector);
        this.causalView = causalView;
        this.undoRedoManager = undoRedoManager;

        api.onReset(() => this.resetProvider(null));
    }

    init() {
        this.component.classed("component", true);

        this.#addSelectionEventListeners();

        this.nodeDataProvider = this.createNodeDataProvider();

        this.nodeDataProvider.addEventListener("reset", () => this.reset());
        this.nodeDataProvider.addEventListener("mutated", () => {
            console.log("Data mutated", this.nodeDataProvider.get());
            this.reset(this.nodeDataProvider.get());
        });
    }

    #addSelectionEventListeners() {
        this.causalView.selectionManager.addEventListener(
            "singleNodeSelected",
            (event) => this.resetProvider(event.nodeData)
        );

        this.causalView.selectionManager.addEventListener(
            "singleNodeNotSelected",
            () => this.resetProvider(null)
        );
    }

    resetProvider(nodeData) {
        this.nodeDataProvider.set(nodeData);
    }

    reset() {
        const nodeData = this.nodeDataProvider.get();
        if (nodeData && !this.shouldHandleReset(nodeData)) {
            return;
        }

        this.clearComponent();

        if (!nodeData) {
            return;
        }
        this.renderNode(nodeData);

        this.setupInputListeners();
    }

    clearComponent() {
        this.component.html("");
    }

    setupInputListeners() {
        this.getPropNamesToData().forEach(([propertyName, { input, isInnerProp, overrideInputHandling }]) => {
            // Apply the change to the actual data
            input.on("input", () => {
                // Custom applying to the actual data
                const propertyValue = input.property("value");
                if (overrideInputHandling) {
                    overrideInputHandling({ propertyName, newValue: propertyValue })
                } else {
                    // Typical properties (like 'name', 'title', etc.)
                    this.nodeDataProvider.changeNonCauseProperty(
                        propertyName,
                        isInnerProp,
                        propertyValue,
                        this.causalView.structure
                    );
                }
            });

            this.updateInput(input, propertyName, isInnerProp);
            this.nodeDataProvider.addEventListener("property-changed", (event) => {
                if (propertyName === event.propertyName) {
                    console.log("Property changed:", event.propertyName, event.newValue);
                    this.updateInput(input, event.propertyName, isInnerProp);
                }
            });
        });
    }

    updateInput(input, propertyName, isInnerProp) {
        const objToGetProp = isInnerProp
            ? this.nodeDataProvider.getInner()
            : this.nodeDataProvider.get();
        input.property("value", objToGetProp[propertyName] ?? "");
    }

    appendTextInputItem(args) {
        return this.appendInputItemCore(inputItem => {
            const input = inputItem
                .append(args.useTextArea ? "textarea" : "input")
                .attr(
                    "class",
                    "input-item__input " + (args.useTextArea ? "textarea" : "text-input")
                )
                .attr("placeholder", args.name);

            if (!args.useTextArea) {
                input.attr("type", "text");
            }
            return input;
        }, args);
    }

    // Returns input containing in input-item
    appendInputItemCore(
        configureInput,
        {
            name,
            inputId,
            isReadonly,
            dontShowLabel,
            propName,
            isInnerProp,
            overrideInputHandling
        }) {
        const inputItem = this.component.append("div").attr("class", "input-item");

        if (!dontShowLabel)
            inputItem.append("label").attr("class", "input-item__label").text(name);

        const input = configureInput(inputItem);
        input.attr("id", inputId);

        if (isReadonly) input.attr("readonly", true);

        if (!this.propNameToData) {
            this.propNameToData = new Map();
        }
        if (propName)
            this.propNameToData.set(propName, { input, isInnerProp, overrideInputHandling });

        return input;
    }

    getPropNamesToData() {
        return Array.from(this.propNameToData.entries());
    }

    renderNode() {
        throw new Error("Method 'renderNode' must be implemented in subclasses.");
    }

    shouldHandleReset() {
        throw new Error("Method 'shouldHandleReset' must be implemented in subclasses.");
    }

    createNodeDataProvider() {
        throw new Error("Method 'createNodeDataProvider' must be implemented in subclasses.");
    }
}
