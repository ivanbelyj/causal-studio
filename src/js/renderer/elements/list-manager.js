import * as d3 from "d3";
import binSrc from "../../../images/bin.svg";

export class ListManager {
    constructor(selector, config) {
        this.component = d3.select(selector);
        this.config = config;
        this.itemsParent = null;
    }

    init() {
        this.renderAddButton();
        return this;
    }

    renderAddButton() {
        this.component.append("button")
            .attr("class", "button input-item")
            .text(this.config.addButtonText || "Add Item")
            .on("click", () => this.addNewItem());
    }

    addNewItem() {
        this.config.onAdd();
    }

    renderItem(item) {
        if (!this.itemsParent) {
            this.itemsParent = this.component.append("div");
        }

        const itemElement = this.itemsParent
            .append("div")
            .attr("class", "component__inner-item");

        const itemTop = itemElement
            .append("div")
            .attr("class", "component__inner-item-top");

        if (this.config.renderItemTop) {
            this.config.renderItemTop(itemTop.node(), item);
        }

        if (this.config.allowRemove !== false) {
            itemTop.append("img")
                .attr("src", this.config.deleteIcon || binSrc)
                .attr("class", "component__remove-icon")
                .style("padding-right", "0")
                .on("click", () => {
                    itemElement.remove();
                    this.config.onRemove(item);
                });
        }

        const itemContent = itemElement.append("div");
        if (this.config.renderItemContent) {
            this.config.renderItemContent(itemContent.node(), item);
        }

        return itemElement;
    }

    renderAll(items) {
        this.clear();
        items?.forEach(item => this.renderItem(item));
    }

    clear() {
        if (this.itemsParent) {
            this.itemsParent.selectAll("*").remove();
        } else {
            this.itemsParent = this.component.append("div");
        }
    }
}