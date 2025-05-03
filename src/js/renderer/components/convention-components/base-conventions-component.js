import { BlockConventionDataProvider } from "../../data/providers/block-convention-data-provider";
import { ListManager } from "../../elements/list-manager";
import { ProjectDataComponent } from "../project-view/project-data-component";
import * as d3 from "d3";

export class BaseConventionsComponent extends ProjectDataComponent {
    setupList(config) {
        this.listManager = new ListManager(this.component.append("div").node(), {
            addButtonText: config.addButtonText,
            deleteIcon: config.deleteIcon,
            createNewItem: config.createNewItem,
            onAdd: config.onAdd,
            onRemove: config.onRemove,
            renderItemTop: config.renderItemTop,
            renderItemContent: config.renderItemContent,
        });
        this.listManager.init();

        if (config.initialItems) {
            this.listManager.renderAll(config.initialItems);
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
            isReadonly: false
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
        });
    }

    createDataProvider() {
        return new BlockConventionDataProvider(this.undoRedoManager);
    }
}