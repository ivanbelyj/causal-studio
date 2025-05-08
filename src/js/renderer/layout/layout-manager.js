import { GoldenLayout } from "golden-layout";
import * as d3 from "d3";

import { createInspectorComponent } from "./component-factories/create-inspector-component.js";
import { createCausalView } from "./component-factories/create-causal-view.js";
import { createCausesComponent } from "./component-factories/create-causes-component.js";
import { createWeightsComponent } from "./component-factories/create-weights-component.js";
import { defaultLayoutConfig } from "./default-layout-config.js";
import LayoutConfigUtils from "./layout-config-utils.js";
import { createProjectView } from "./component-factories/create-project-view.js";
import { createNodeComponent } from "./component-factories/create-node-component.js";
import { createFixationResultsComponent } from "./component-factories/create-fixation-results-component.js";
import { createProbabilityEstimationResultsComponent } from "./component-factories/create-probability-estimation-results-component.js";
import { CausalBundleDataManager } from "../data/causal-bundle-data-manager.js";
import { createFactValueTransformerComponent } from "./component-factories/create-fact-value-transformer-component.js";

const createComponentConfig = (createComponent, type, options = {}) => ({
  createComponent,
  data: { type, isCloseable: true, ...options }
});

const componentConfigs = [
  { type: "Causal View", createComponent: createCausalView, options: { isCloseable: false } },
  { type: "Node", createComponent: createNodeComponent },
  { type: "Causes", createComponent: createCausesComponent },
  { type: "Weights", createComponent: createWeightsComponent },
  { type: "Project View", createComponent: createProjectView, options: { isCloseable: false } },
  { type: "Inspector", createComponent: createInspectorComponent },
  { type: "Fixation Results", createComponent: createFixationResultsComponent },
  { type: "Probability Estimation Results", createComponent: createProbabilityEstimationResultsComponent },
  { type: "Transform Tools", createComponent: createFactValueTransformerComponent }
];

const componentConfigsByType = componentConfigs.reduce((acc, config) => {
  acc[config.type] = createComponentConfig(
    config.createComponent,
    config.type,
    config.options || {}
  );
  return acc;
}, {});

export class LayoutManager {
  /**
   * 
   * @param {*} layoutSelector 
   * @param {*} api 
   * @param {CausalBundleDataManager} dataManager 
   * @param {*} undoRedoManager 
   */
  constructor(layoutSelector, api, dataManager, undoRedoManager) {
    this.layoutContainer = d3
      .select(layoutSelector)
      .attr("class", "layout-container");
    this.api = api;

    this.componentTypesAndItems = new Map();

    this.dataManager = dataManager;

    this.undoRedoManager = undoRedoManager;
  }

  initLayout(config) {
    if (!config) config = defaultLayoutConfig;

    this.#initGoldenLayout();

    this.#registerComponents();
    this.#loadConfig(config);

    this.api.onSetComponentActive(this.#onSetComponentActive.bind(this));

    // d3.selectAll(".lm_stack").attr("tabindex", 0);
  }

  #initGoldenLayout() {
    const layout = new GoldenLayout(this.layoutContainer.node());
    this.layout = layout;

    layout.layoutConfig.header.popout = false;
    layout.resizeWithContainerAutomatically = true;
    layout.on("focus", function () {
      layout.clearComponentFocus();
    });

    layout.on("itemCreated", this.#onItemCreatedOrDestroyed.bind(this, true));
    layout.on(
      "itemDestroyed",
      this.#onItemCreatedOrDestroyed.bind(this, false)
    );
  }

  /**
   * When check the according item in the menu in the main process
   */
  #onSetComponentActive(event, { componentType, isActive }) {
    const locationSelectors =
      // LayoutManager.afterFocusedItemIfPossibleLocationSelectors;
      [
        { typeId: 3 /* FirstRowOrColumn */, index: 1 },
        // { typeId: 0 /* FocusedItem */, index: 1 },
        // { typeId: 2 /* FirstStack */, index: undefined },
        { typeId: 7 /* Root */, index: undefined },
      ];
    if (isActive) {
      this.layout.addComponentAtLocation(
        componentType,
        null,
        componentType,
        locationSelectors
      );

      if (!this.componentTypesAndItems.has(componentType))
        this.componentTypesAndItems.set(componentType, null);
    } else {
      const compItemToClose = this.componentTypesAndItems.get(componentType);
      compItemToClose?.close();
      this.componentTypesAndItems.delete(componentType);
    }
  }

  #onItemCreatedOrDestroyed(isCreated, event) {
    const componentType = event.target.componentType;
    if (!componentType) return; // It is not a component

    if (isCreated) {
      this.componentTypesAndItems.set(componentType, event.target);
    } else {
      this.componentTypesAndItems.delete(componentType);
    }
    this.#sendComponentActive(componentType, isCreated);
  }

  #sendComponentActive(componentType, isActive) {
    this.api.sendComponentActive({
      componentType,
      isActive,
      componentData: componentConfigsByType[componentType].data
    });
  }

  #loadConfig(config) {
    const loadedFromConfig =
      LayoutConfigUtils.getComponentTypesFromLayoutConfig(config);
    for (const componentType in componentConfigsByType) {
      this.#sendComponentActive(
        componentType,
        loadedFromConfig.includes(componentType));
    }
    this.layout.loadLayout(config);
  }

  /**
   * - Should be called once
   * - Every factory function will be bound to this LayoutManager
   */
  #registerComponents() {
    // Components can put something here (in particular,
    // causalView reference will be available in this object)
    const componentsContext = {};
    const args = {
      layoutContainer: this.layoutContainer,
      api: this.api,
      componentTypesAndItems: this.componentTypesAndItems,
      dataManager: this.dataManager,
      undoRedoManager: this.undoRedoManager,
      layout: this.layout,
      componentsContext
    };

    for (const [componentType, componentConfig] of Object.entries(
      componentConfigsByType
    )) {
      this.layout.registerComponentFactoryFunction(
        componentType,
        componentConfig.createComponent.bind({}, args)
      );
    }
  }
}
