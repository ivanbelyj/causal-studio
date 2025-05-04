import { BlockConventionDataProvider } from "../../data/providers/block-convention-data-provider";
import { ListManager } from "../../elements/list-manager";
import { ProjectDataComponent } from "../project-view/project-data-component";
import * as d3 from "d3";

export class BaseConventionsComponent extends ProjectDataComponent {
    setupList(config) {
        const listConfig = { ...config };

        if (!config.isReadonly) {
            listConfig.customAddForm = {
                renderForm: (formElement) => {
                    const formGroup = d3.select(formElement)
                        .style("display", "flex")
                        .classed("input-item", true);

                    const input = formGroup.append("input")
                        .attr("type", "text")
                        .attr("class", "text-input input-item__input")
                        .attr("placeholder", config.inputPlaceholder || 'Enter value')
                        .style("border-top-right-radius", "0")
                        .style("border-bottom-right-radius", "0")
                        .style("margin-right", "-1px")
                        .on("keypress", (event) => {
                            if (event.key === "Enter") {
                                this.handleAddItem(input.node(), config.onAdd);
                            }
                        });

                    formGroup.append("button")
                        .attr("class", "button")
                        .style("border-top-left-radius", "0")
                        .style("border-bottom-left-radius", "0")
                        .style("padding", "0.5em 0.75em")
                        .text("+")
                        .on("click", () => this.handleAddItem(input.node(), config.onAdd));
                }
            };
        }

        this.listManager = new ListManager(this.component.append("div").node(), listConfig);
        this.listManager.init();

        if (config.initialItems) {
            this.listManager.renderAll(config.initialItems);
        }
    }

    handleAddItem(inputElement, onAddCallback) {
        const value = inputElement.value.trim();
        if (value) {
            onAddCallback(value);
            inputElement.value = '';
        }
    }

    setupResetByDataProviderEvents(dataProvider) {
        super.setupResetByDataProviderEvents(dataProvider);
        dataProvider.addEventListener("mutated", () => this.reset());
    }

    renderCommonInputs({ nameInputId, nameLabel, itemLabel, initialItems, onAdd, onRemove, isReadonly = false }) {
        this.appendTextInputItem({
            name: nameLabel,
            inputId: nameInputId,
            propName: "name",
            isInnerProp: false,
            isReadonly: isReadonly
        });

        this.setupList({
            addButtonText: `Add ${itemLabel}`,
            createNewItem: () => '',
            onAdd: onAdd,
            onRemove: onRemove,
            renderItemTop: (container, item) => {
                const input = d3.select(container)
                    .append('input')
                    .attr('type', 'text')
                    .attr('class', 'text-input input-item__input')
                    .attr('readonly', true)
                    .property('value', item);
            },
            initialItems: initialItems,
            isReadonly: isReadonly,
            inputPlaceholder: `Enter ${itemLabel.toLowerCase()}`,
            allowRemove: !isReadonly
        });
    }

    createDataProvider() {
        return new BlockConventionDataProvider(this.undoRedoManager);
    }
}