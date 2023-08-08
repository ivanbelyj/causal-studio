import * as d3 from "d3";

export class CausesItem {
  constructor({ selector, isRemovable, onRemove, isRoot, causesExpression }) {
    this.selector = selector;
    this.component = d3.select(selector);
    // this.data = probabilityNest;
    this.isRemovable = isRemovable ?? false;
    this.onRemove = onRemove ?? null;

    // Knowing isRootItem is required to have only one right border for inner items
    this.isRoot = isRoot ?? false;

    this.causesExpression = causesExpression;
  }

  init() {
    // every causes-item has item top (for select type or remove item)
    const itemTop = this.component
      .append("div")
      .attr("class", "causes-item__item-top");

    // Removable item has remove-icon instead of padding
    if (this.isRemovable) {
      itemTop.style("padding-right", "0");
    }

    const selectElem = itemTop
      .append("select")
      .attr("class", "input-item input-item__input");

    if (this.isRemovable) {
      // itemTop.append("button").attr("class", "button").text("Remove");
      itemTop
        .append("img")
        .attr("src", "images/bin.svg")
        .attr("class", "causes-item__remove-icon")
        .on("click", this.onRemove);
    }

    selectElem.append("option").attr("value", "not selected").text("None");
    selectElem.append("option").attr("value", "factor").text("Factor");
    selectElem.append("option").attr("value", "and").text("And");
    selectElem.append("option").attr("value", "or").text("Or");
    selectElem.append("option").attr("value", "not").text("Not");

    if (this.causesExpression) {
      selectElem.property("value", this.causesExpression.$type);
    }

    selectElem.on(
      "change",
      function () {
        var selectedValue = selectElem.node().value;
        this.causesExpression = null;
        this.updateContent(selectedValue);
        // Todo: transform old causesExpression data to new type
      }.bind(this)
    );

    if (this.causesExpression) {
      CausesItem.createCausesItemFromCausesExpression(
        this,
        this.causesExpression
      );
    }
  }

  static createCausesItemFromCausesExpression(causeItem, expr) {
    causeItem.updateContent(expr.$type);

    // Update inner items
    if (expr.Operands) {
      for (const operandExpr of expr.Operands) {
        const newItem = causeItem.appendInnerItemChild(operandExpr);
        this.createCausesItemFromCausesExpression(newItem, operandExpr);
      }
    }
  }

  // updates item itself (for some types may create inner items)
  updateContent(type) {
    if (this.content) {
      this.content.remove();
    }
    this.content = this.component.append("div");
    if (this.listParent) {
      this.listParent = null;
    }

    switch (type) {
      case "factor":
        this.createFactorItem();
        break;
      case "and":
      case "or":
        this.createAndOrItem();
        break;
      case "not":
        this.createNotItem();
      default:
    }
  }

  createFactorItem() {
    // this.content.html(function (d, i) {
    //   return `
    //     <div>
    //         <input type="number" class="input-item text-input input-item__input" placeholder="Probability">
    //         <input type="number" class="input-item text-input input-item__input" placeholder="CauseId">
    //     </div>
    //     `;
    // });

    const probabilityInput = this.content
      .append("input")
      .attr("type", "number")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Probability");

    const causeIdInput = this.content
      .append("input")
      .attr("type", "text")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "CauseId");

    if (this.causesExpression) {
      if (this.causesExpression.$type === "factor") {
        console.log("set probability", this.causesExpression);
        probabilityInput.property(
          "value",
          this.causesExpression.Edge.Probability
        );
        causeIdInput.property("value", this.causesExpression.Edge.CauseId);
      } else {
        console.error(
          "Incorrect causesExpression for factor item creation: ",
          this.causesExpression
        );
      }
    }

    probabilityInput.on("change", (event) => {
      console.log("probability is changed");
      //   this.data.Edge.Probability = parseFloat(
      //     d3.select(event.target).property("value")
      //   );
    });

    causeIdInput.on("change", (event) => {
      console.log("causeId is changed");
      //   this.data.Edge.CauseId = d3.select(event.target).property("value");
    });
  }

  createAndOrItem() {
    this.content.style("padding-right", "0"); // reduced to save space

    // Button to add new items
    var addButton = this.content
      .append("button")
      .attr("class", "button input-item cause-item__add-button")
      .text("Add Operand");

    addButton.on("click", this.appendInnerItemChild.bind(this));
  }

  appendInnerItemChild(causesExpression) {
    if (!this.listParent) this.listParent = this.content.append("ul");
    // .attr("class", "causes-item__content");

    const newItem = this.listParent.append("li");
    return this.createInnerItem(newItem.node(), true, causesExpression);
  }

  // Inner item is visually separated from outer (borders and padding)
  createInnerItem(selector, isRemovable, causesExpression) {
    if (!causesExpression) {
      causesExpression = null;
    }

    const itemSelection = d3
      .select(selector)
      .attr("class", "causes-item__inner-item");

    // Every inner item reduces padding-right to save space
    itemSelection.style("padding-right", "0");

    if (!this.isRoot) {
      itemSelection.style("border-right", "none");
    }

    const newItem = new CausesItem({
      selector,
      isRemovable,
      onRemove: isRemovable
        ? () => {
            itemSelection.remove();
          }
        : null,
      isRoot: false, // New inner item is not root item,
      causesExpression,
    });
    newItem.init();

    return newItem;
  }

  createNotItem() {
    // const inner = this.content.append("div");
    this.content.style("padding-right", "0"); // reduced to save space

    this.createInnerItem(this.content.node(), false);
  }
}
