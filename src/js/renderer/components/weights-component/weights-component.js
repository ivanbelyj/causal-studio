import * as d3 from "d3";
import { SelectNodeElement } from "../../elements/select-node-element.js";
import binSrc from "../../../../images/bin.svg";
import { FactDataProvider } from "../providers/fact-data-provider.js";

// Block is used as a part of a component
export class WeightsComponent {
  constructor(selector, causalView, api, undoRedoManager, causesChangeManager) {
    // Parent element
    this.component = d3.select(selector);
    this.causalView = causalView;

    this.causesChangeManager = causesChangeManager;
    api.onProbabilityEstimationCompleted((event, data) => console.log(data));

    api.onReset(
      function (event, data) {
        this.resetProvider(null);
      }.bind(this)
    );

    this.undoRedoManager = undoRedoManager;

    this.nodeDataProvider = new FactDataProvider(
      this.undoRedoManager,
      this.causesChangeManager
    );
    this.nodeDataProvider.addEventListener("mutated", this.reset.bind(this));
    this.nodeDataProvider.addEventListener("reset", this.reset.bind(this));
  }

  resetProvider(nodeData) {
    this.nodeDataProvider.set(nodeData);
  }

  init() {
    this.component.classed("component", true);

    this.causalView.selectionManager.addEventListener(
      "singleNodeSelected",
      function (event) {
        this.resetProvider(event.nodeData);
      }.bind(this)
    );

    this.causalView.selectionManager.addEventListener(
      "singleNodeNotSelected",
      function (event) {
        this.resetProvider(null);
      }.bind(this)
    );

    // if (causalModelFact) this.reset(causalModelFact);
  }

  reset() {
    this.component.html("");

    const causalFact = this.nodeDataProvider.get()?.fact;
    if (!causalFact) return;

    // this.causesChangeManager.reset(causalFact);

    this.appendAbstractFactIdInput();

    // Button to add new items
    const addButton = this.component
      .append("button")
      .attr("class", "button input-item")
      .text("Add Weight Edge")
      .on("click", () => this.nodeDataProvider.addNewWeightEdge());

    this.resetItems();
  }

  getWeights() {
    return this.nodeDataProvider.get()?.fact.weights;
  }

  // Content is a part of component that is changing
  resetItems() {
    if (this.itemsParent) {
      this.itemsParent.remove();
      this.itemsParent = null;
    }

    const weights = this.getWeights();
    if (weights)
      for (const weightEdge of weights) {
        this.appendItem(weightEdge);
      }
  }

  appendAbstractFactIdInput() {
    this.component
      .append("label")
      .attr("class", "input-item__label")
      .text("Abstract Fact Id");

    new SelectNodeElement(
      this.component.append("div").node(),
      this.causalView,
      this.nodeDataProvider.changeAbstractFactId.bind(this.nodeDataProvider)
    ).init(this.nodeDataProvider.getFact().abstractFactId);
  }

  appendItem(weightEdge) {
    if (!this.itemsParent) this.itemsParent = this.component.append("div");

    const item = this.itemsParent
      .append("div")
      .attr("class", "component__inner-item");

    const itemTop = item
      .append("div")
      .attr("class", "component__inner-item-top");

    const itemContent = item.append("div");

    const weightInput = itemTop
      .append("input")
      .attr("type", "number")
      .attr("step", "1")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Weight")
      .property("value", weightEdge.weight ?? "");

    weightInput.on(
      "change",
      function (event) {
        const newWeight = parseFloat(d3.select(event.target).property("value"));
        this.nodeDataProvider.changeWeightEdgeWeight(weightEdge, newWeight);
      }.bind(this)
    );

    itemTop
      .append("img")
      .attr("src", binSrc)
      .attr("class", "component__remove-icon")
      .style("padding-right", "0")
      .on(
        "click",
        function (event) {
          item.remove();
          this.nodeDataProvider.removeEdge(weightEdge);
        }.bind(this)
      );

    new SelectNodeElement(
      itemContent.append("div").node(),
      this.causalView,
      function (newId) {
        this.nodeDataProvider.changeWeightEdgeCauseId(weightEdge, newId);
      }.bind(this)
    ).init(weightEdge.causeId);
  }
}
