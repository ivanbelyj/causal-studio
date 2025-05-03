import * as d3 from "d3";

export class BaseComponent {
    constructor(selector, api, undoRedoManager) {
        this.selector = selector;
        this.component = d3.select(selector);
        this.api = api;
        this.undoRedoManager = undoRedoManager;
        this.dataProvider = this.createDataProvider();

        // api.onReset(() => this.resetProvider(null));

        this.dataProvider.addEventListener("reset", () => this.reset());
        this.dataProvider.addEventListener("mutated", () => {
            console.log("Data mutated", this.dataProvider.get());
        });

        this.propNameToData = new Map();
    }

    init() {
        this.component.classed("component", true);
    }

    resetProvider(data) {
        this.dataProvider.set(data);
    }

    reset() {
        const data = this.dataProvider.get();
        if (data && !this.shouldHandleReset(data)) {
            return;
        }

        this.clearComponent();

        if (!data) {
            return;
        }

        this.render(data);
        this.setupInputListeners();
    }

    clearComponent() {
        this.component.html("");
    }

    setupInputListeners() {
        this.getPropNamesToData().forEach(([propertyName, { input, isInnerProp, processValueBeforeSet }]) => {
            input.on("input", () => {
                const propertyValue = input.property("value");
                this.dataProvider.changeProperty(
                    propertyName,
                    isInnerProp,
                    processValueBeforeSet ? processValueBeforeSet(propertyValue) : propertyValue
                );
            });

            this.updateInput(input, propertyName, isInnerProp);
            this.dataProvider.addEventListener("property-changed", (event) => {
                if (propertyName === event.propertyName) {
                    console.log("Property changed:", event.propertyName, event.newValue);
                    this.updateInput(input, event.propertyName, isInnerProp);
                }
            });
        });
    }

    updateInput(input, propertyName, isInnerProp) {
        const objToGetProp = isInnerProp
            ? this.dataProvider.getInner()
            : this.dataProvider.get();
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

    appendInputItemCore(
        configureInput,
        {
            name,
            inputId,
            isReadonly,
            dontShowLabel,
            propName,
            isInnerProp,
            processValueBeforeSet
        }) {
        const inputItem = this.component.append("div").attr("class", "input-item");

        if (!dontShowLabel)
            inputItem.append("label").attr("class", "input-item__label").text(name);

        const input = configureInput(inputItem);
        input.attr("id", inputId);

        if (isReadonly) input.attr("readonly", true);

        if (propName)
            this.propNameToData.set(propName, { input, isInnerProp, processValueBeforeSet });

        return input;
    }

    getPropNamesToData() {
        return Array.from(this.propNameToData.entries());
    }

    render() {
        throw new Error("Method 'render' must be implemented in subclasses.");
    }

    shouldHandleReset() {
        throw new Error("Method 'shouldHandleReset' must be implemented in subclasses.");
    }

    createDataProvider() {
        throw new Error("Method 'createDataProvider' must be implemented in subclasses.");
    }
}