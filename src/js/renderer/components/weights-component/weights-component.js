import * as d3 from "d3";
import { SelectNodeElement } from "../../elements/select-node-element.js";
import BlockUtils from "../../common/block-utils.js";
import { ListManager } from "../../elements/list-manager.js";
import { FactDataProvider } from "../../data/providers/fact-data-provider.js";

export class WeightsComponent {
  constructor(selector, causalView, api, undoRedoManager, causesChangeManager, blockConventionsProvider) {
    this.component = d3.select(selector);
    this.causalView = causalView;
    this.causesChangeManager = causesChangeManager;
    this.blockConventionsProvider = blockConventionsProvider;

    api.onReset(() => this.resetProvider(null));

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
      (event) => this.resetProvider(event.nodeData)
    );

    this.causalView.selectionManager.addEventListener(
      "singleNodeNotSelected",
      () => this.resetProvider(null)
    );
  }

  reset() {
    this.component.html("");
    const causalFact = this.nodeDataProvider.get()?.fact;
    if (!causalFact) return;

    this.appendAbstractFactIdInput();

    this.listManager = new ListManager(this.component.node(), {
      addButtonText: 'Add Weight Edge',
      onAdd: () => this.nodeDataProvider.addNewWeightEdge(),
      onRemove: (item) => this.nodeDataProvider.removeEdge(item),
      renderItemTop: (container, weightEdge) => this.renderWeightItemTop(container, weightEdge),
      renderItemContent: (container, weightEdge) => this.renderWeightItemContent(container, weightEdge)
    });

    this.listManager.init();
    this.listManager.renderAll(this.getWeights());
  }

  getWeights() {
    return this.nodeDataProvider.get()?.fact.weights || [];
  }

  appendAbstractFactIdInput() {
    this.component
      .append("label")
      .attr("class", "input-item__label")
      .text("Abstract Fact Id");

    new SelectNodeElement(
      this.component.append("div").node(),
      this.causalView,
      this.blockConventionsProvider,
      (newId) => this.nodeDataProvider.changeAbstractFactId(newId),
      ({ block, blockConsequenceName }) => {
        this.nodeDataProvider.changeAbstractFactId(
          BlockUtils.createCauseIdByBlockConsequence(block.id, blockConsequenceName),
          { declaredBlock: block, blockConsequenceName }
        );
      }
    ).init(this.nodeDataProvider.getFact().abstractFactId);
  }

  renderWeightItemTop(container, weightEdge) {
    d3.select(container)
      .append("input")
      .attr("type", "number")
      .attr("step", "1")
      .attr("class", "input-item text-input input-item__input")
      .attr("placeholder", "Weight")
      .property("value", weightEdge.weight ?? "")
      .on("change", (event) => {
        const newWeight = parseFloat(d3.select(event.target).property("value"));
        this.nodeDataProvider.changeWeightEdgeWeight(weightEdge, newWeight);
      });
  }

  renderWeightItemContent(container, weightEdge) {
    new SelectNodeElement(
      d3.select(container).append("div").node(),
      this.causalView,
      this.blockConventionsProvider,
      (newId) => this.nodeDataProvider.changeWeightEdgeCauseId(weightEdge, newId),
      ({ block, blockConsequenceName }) => {
        this.nodeDataProvider.changeWeightEdgeCauseId(
          weightEdge,
          BlockUtils.createCauseIdByBlockConsequence(block.id, blockConsequenceName),
          { declaredBlock: block, blockConsequenceName }
        );
      }
    ).init(weightEdge.causeId);
  }
}