import * as d3 from "d3";
const eventBus = require("js-event-bus")();

const valueSubstitute = "{[value]}";

// Warning: this component is based on ai-generated response
export class FactValueTransformerComponent {
    constructor(selector, api, dataManager, causalView, window) {
        this.selector = selector;
        this.component = d3.select(selector);
        this.api = api;
        this.dataManager = dataManager;
        this.causalView = causalView;
        this.window = window;

        this.state = {
            selectedModel: "",
            sourcePath: "",
            template: "",
            error: null,
            success: null
        };
    }

    init() {
        this.component.classed("component", true);
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.component.html("");

        const infoItemParent = this.component
            .append("div")
            .classed("input-item", true);

        // Title and description
        // Todo: reuse UI building logic with ExternalFactComponent at least
        infoItemParent.append("div")
            .text("Fact Value Transformer")
            .style("font-weight", "bold")
            .style("margin-bottom", "0.5em");

        infoItemParent.append("div")
            .text("This tool allows you to transform fact values across all facts in a causal model. Changes cannot be undone.")
            .style("color", "var(--disabled-text)");

        // Causal model selector
        this.appendSelectItem({
            name: "Select Causal Model",
            inputId: "transform-causal-model-select",
            propName: "selectedModel",
            optionValues: [""].concat(this.dataManager.causalModels.map(m => m.name)),
            optionTexts: ["-- Select Model --"].concat(this.dataManager.causalModels.map(m => m.name))
        });

        // Source path input
        this.appendTextInputItem({
            name: "Source Path (leave empty to use whole fact value)",
            inputId: "transform-source-path",
            propName: "sourcePath",
            placeholder: "e.g. appearance.appearanceItem"
        });

        // Template textarea
        this.appendTextInputItem({
            name: `Template (use ${valueSubstitute} for the source value, leave empty to replace whole fact value)`,
            inputId: "transform-template",
            propName: "template",
            useTextArea: true,
            placeholder: `e.g. { "appearance": { "appearanceItem": ${valueSubstitute} } }`
        });

        // Transform button
        this.component.append("div")
            .attr("class", "input-item")
            .append("button")
            .attr("class", "button")
            .text("Transform Values")
            .on("click", () => this.transformValues());

        // Error message
        this.component.append("div")
            .attr("class", "input-item")
            .style("color", "red")
            .style("margin-top", "1em")
            .text(() => this.state.error || "");

        // Success message
        this.component.append("div")
            .attr("class", "input-item")
            .style("color", "green")
            .style("margin-top", "1em")
            .text(() => this.state.success || "");
    }

    appendTextInputItem(args) {
        const inputItem = this.component.append("div").attr("class", "input-item");

        if (!args.dontShowLabel) {
            inputItem.append("label")
                .attr("class", "input-item__label")
                .text(args.name);
        }

        const input = inputItem.append(args.useTextArea ? "textarea" : "input")
            .attr("class", `input-item__input ${args.useTextArea ? "textarea" : "text-input"}`)
            .attr("id", args.inputId)
            .attr("placeholder", args.placeholder || "")
            .property("value", this.state[args.propName] || "");

        if (!args.useTextArea) {
            input.attr("type", "text");
        }

        input.on("input", () => {
            this.state[args.propName] = input.property("value");
            this.state.error = null;
            this.state.success = null;
        });

        return input;
    }

    appendSelectItem(args) {
        const inputItem = this.component.append("div").attr("class", "input-item");

        inputItem.append("label")
            .attr("class", "input-item__label")
            .text(args.name);

        const select = inputItem.append("select")
            .attr("class", "input-item__input")
            .attr("id", args.inputId);

        for (let i = 0; i < args.optionValues.length; i++) {
            select.append("option")
                .attr("value", args.optionValues[i])
                .text(args.optionTexts?.[i] || args.optionValues[i]);
        }

        select.property("value", this.state[args.propName] || "")
            .on("change", () => {
                this.state[args.propName] = select.property("value");
                this.state.error = null;
                this.state.success = null;
            });

        return select;
    }

    setupEventListeners() {
        // Additional event listeners if needed
    }

    transformValues() {
        try {
            const { selectedModel, sourcePath, template } = this.state;

            // Validate inputs
            if (!selectedModel) {
                throw new Error("Please select a causal model");
            }

            const causalModel = this.dataManager.causalModels.find(m => m.name === selectedModel);
            if (!causalModel) {
                throw new Error("Selected model not found");
            }

            // Transform facts
            let transformedCount = 0;
            const errors = [];

            causalModel.facts.forEach(fact => {
                try {
                    let factValue;
                    try {
                        factValue = JSON.parse(fact.factValue);
                    } catch {
                        // If not valid JSON, treat as plain string
                        factValue = fact.factValue;
                    }

                    // Get source value
                    let sourceValue = factValue;
                    if (sourcePath) {
                        const pathParts = sourcePath.split('.');
                        for (const part of pathParts) {
                            if (sourceValue && typeof sourceValue === 'object' && part in sourceValue) {
                                sourceValue = sourceValue[part];
                            } else {
                                throw new Error(`Path '${sourcePath}' not found in fact value`);
                            }
                        }
                    }

                    // Create new value
                    let newValue;
                    if (template) {
                        newValue = JSON.parse(template.replace(valueSubstitute, JSON.stringify(sourceValue)));
                    } else {
                        newValue = sourceValue;
                    }

                    // Update fact
                    fact.factValue = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
                    transformedCount++;
                } catch (error) {
                    errors.push(`Fact ${fact.id}: ${error.message}`);
                }
            });

            if (errors.length > 0) {
                throw new Error(`Transformed ${transformedCount} facts, but encountered errors:\n${errors.join('\n')}`);
            }

            this.refreshEditor();
            this.state.success = `Successfully transformed ${transformedCount} fact values`;
            this.state.error = null;
        } catch (error) {
            this.state.error = error.message;
            this.state.success = null;
            console.error("Transform error:", error);
        }

        // Re-render to show messages
        this.render();
    }

    refreshEditor() {
        eventBus.emit("causalModelSelected", null, {
            causalModelName: this.state.selectedModel,
        });
    }
}