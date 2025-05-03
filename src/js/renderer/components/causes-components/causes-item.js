import * as d3 from "d3";
import { SelectNodeElement } from "../../elements/select-node-element.js";
import binImgSrc from "../../../../images/bin.svg";

// Todo: there can be used ListManager for list rendering,
// but it's quite dangerous to refactor vanilla JS

/**
 * CausesItem is a UI element representing causes expression.
 * It includes top (with type dropdown) and content that can include
 * another CausesItem inner elements
 */
export class CausesItem {
  // There are some properties that don't change after reset. They are set in constructor.
  // Selector for item is constant (the item is always in the same place in DOM).
  // It does not depend on the causesExpression whether the element can be deleted or not
  // so isRemovable and isRoot are also constant.
  constructor({
    selector,
    isRemovable,
    onRemoveClick,
    isRoot,
    causalView,
    causesExpressionProvider,
    blockConventionsProvider
  }) {
    this.selector = selector;
    this.component = d3.select(selector);
    this.isRemovable = isRemovable ?? false;
    this.onRemoveClick = onRemoveClick;

    // It's necessary to update changes in CausalView
    // because d3 tracks flat data, not nested and mutating

    // Knowing isRootItem is required to have only one right border for inner items
    this.isRoot = isRoot ?? false;

    this.causalView = causalView;

    this.causesExpressionProvider = causesExpressionProvider;
    causesExpressionProvider.addEventListener("reset", this.reset.bind(this));
    causesExpressionProvider.addEventListener("mutated", this.reset.bind(this));

    this.blockConventionsProvider = blockConventionsProvider;
  }

  // Resets causes item's provider with causes expression
  resetProvider(causesExpression) {
    this.causesExpressionProvider.set(causesExpression);
  }

  reset() {
    this.component.html("");

    const expr = this.causesExpressionProvider.get();

    this.resetItemTop();

    // Reset content and remove inner items
    this.resetContent();

    if (!expr) return;

    // Create actual inner items
    const childrenProviders =
      this.causesExpressionProvider.createAndSetChildrenExpressionProviders();
    if (childrenProviders.length > 0) {
      for (const childProvider of childrenProviders) {
        const newItem = this.appendInnerItem(
          expr.$type !== "not",
          // Inner items are not removable only in the inversion operation
          // (there is always only an operand)
          childProvider
        );
        newItem.reset();
      }
    }
  }

  resetItemTop() {
    if (this.itemTop) {
      // this.itemTop.remove();
    }

    // Every causes-item has item top (for selecting the type
    // or removing the item)
    this.itemTop = this.component
      .append("div")
      .attr("class", "component__inner-item-top");

    // Removable item has a remove icon instead of the padding
    if (this.isRemovable) {
      this.itemTop.style("padding-right", "0");
    }

    const typeDropdown = (this.typeDropdown = this.itemTop
      .append("select")
      .attr("class", "input-item input-item__input"));

    if (this.isRemovable) {
      this.itemTop
        .append("img")
        .attr("src", binImgSrc)
        .attr("class", "component__remove-icon")
        .on(
          "click",
          function () {
            // Removing is already handled by mutated event
            // this.component.remove();

            this.onRemoveClick?.(this.causesExpressionProvider.get());
          }.bind(this)
        );
    }

    const defaultOptionValue = "factor";
    [defaultOptionValue, "and", "or", "not"].forEach((optionVal) => {
      typeDropdown
        .append("option")
        .attr("value", optionVal)
        .text(optionVal.charAt(0).toUpperCase() + optionVal.slice(1));
    });

    typeDropdown.property(
      "value",
      this.causesExpressionProvider.get()?.$type ?? defaultOptionValue
    );

    const nodeData = this.causesExpressionProvider.nodeData;
    typeDropdown.on(
      "change",
      function (e) {
        this.causesExpressionProvider.changeExpressionType(
          nodeData,
          e.target.value
        );
      }.bind(this)
    );
  }

  // After removing all content and inner items resetContent() creates
  // item content itself only (without inner items)
  resetContent() {
    if (this.content) {
      // this.content.remove();
    }
    this.content = this.component.append("div");
    if (this.innerItemsParent) {
      this.innerItemsParent = null;
    }

    switch (this.causesExpressionProvider.get().$type) {
      case "factor":
        this.setFactorItemContent();
        break;
      case "and":
      case "or":
        this.setAndOrItemContent();
        break;
      case "not":
        this.setNotItemContent();

      default:
    }
  }

  setFactorItemContent() {
    const expr = this.causesExpressionProvider.get();
    if (expr.$type != "factor") {
      console.error(
        "Incorrect causesExpression for factor item creation: ",
        this.expr
      );
    }

    const probabilityInput = this.content
      .append("input")
      .attr("type", "number")
      .attr("min", "0")
      .attr("max", "1")
      .attr("step", "0.1")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Probability")
      .property("value", expr.edge.probability)
      .on(
        "change",
        function (event) {
          this.causesExpressionProvider.changeProbability(
            parseFloat(d3.select(event.target).property("value"))
          );
        }.bind(this)
      );

    new SelectNodeElement(
      this.content.append("div").node(),
      this.causalView,
      this.blockConventionsProvider,
      (newCauseId) => {
        this.causesExpressionProvider.changeCauseId(
          this.causesExpressionProvider.nodeData,
          newCauseId
        );
      },
      ({ blockId, blockConsequenceName, block }) => {
        // Todo: rename blockConsequenceId to blockConsequenceName
        this.causesExpressionProvider.changeCauseIdAndBlockConsequenceMapping(
          this.causesExpressionProvider.nodeData,
          block,
          blockConsequenceName
        );
      }
    ).init(expr.edge.causeId);
  }

  setAndOrItemContent() {
    // Padding is reduced to save space
    this.content.style("padding-right", "0");

    // A button for adding new items
    const addButton = this.content
      .append("button")
      .attr("class", "button input-item")
      .text("Add Operand");

    addButton.on(
      "click",
      function (event) {
        this.causesExpressionProvider.addNewOperand();
        // appending new inner item is already handled
        // by mutated event
        // (function (newExprProvider) {
        //   this.appendInnerItem(true, newExprProvider);
        // }.bind(this))
      }.bind(this)
    );
  }

  setNotItemContent() {
    // Padding is reduced to save space
    this.content.style("padding-right", "0");
  }

  appendInnerItem(isRemovable, causesExpressionProvider) {
    if (!this.innerItemsParent)
      this.innerItemsParent = this.content.append("div");

    // Inner item is visually separated from the outer
    const itemSelection = this.innerItemsParent
      .append("div")
      .attr("class", "component__inner-item")
      .style("padding-right", "0");
    // Every inner item reduces padding-right to save space

    if (!this.isRoot) {
      itemSelection.style("border-right", "none");
    }

    const newItem = new CausesItem({
      selector: itemSelection.node(),
      isRemovable,
      onRemoveClick: this.causesExpressionProvider.removeOperand.bind(
        this.causesExpressionProvider
      ),
      isRoot: false, // Inner item can't be the root
      causalView: this.causalView,
      causesExpressionProvider,
      blockConventionsProvider: this.blockConventionsProvider
    });

    return newItem;
  }
}
