import { CausalView } from "./causal-view.js";
import { CausalViewSelectionManager } from "./selection/selection-manager.js";

import * as d3 from "d3";
import { NodesCreateRemoveManager } from "./nodes-create-remove-manager.js";
import { CausesChangeManager } from "../common/causes-change-manager.js";
import { CausalViewDataManager } from "./causal-view-data-manager.js";
import { DeclaredBlockDialog } from "../elements/declared-block-dialog.js";
import { DeclareBlockHelper } from "./declare-block-helper.js";
import { CausalViewDataUtils } from "./causal-view-data-utils.js";
import { CausalBundleDataManager } from "../data/causal-bundle-data-manager.js";

const eventBus = require("js-event-bus")();

/**
 * A component managing causal view
 */
export class CausalViewManager {
  structure = null;
  selectionManager = null;

  #eventHandlers;

  /**
   * 
   * @param {*} selector 
   * @param {*} api 
   * @param {*} undoRedoManager 
   * @param {CausalBundleDataManager} dataManager 
   */
  constructor(selector, api, undoRedoManager, dataManager) {
    this.undoRedoManager = undoRedoManager;
    this.causesChangeManager = new CausesChangeManager(this);
    this.api = api;

    this.#eventHandlers = {};

    this.#initNodesApiCallbacks();

    this.causalViewDataManager = new CausalViewDataManager();
    this.causalViewDataManager.init({
      api,
      causalViewManager: this,
    });

    this.declareBlockHelper = new DeclareBlockHelper();

    this.#initEnterLeaveView(selector);

    this.dataManager = dataManager;
    this.dataManager.setCurrentCausalViewDataManager(this.causalViewDataManager);
  }

  init(nodesData) {
    this.#initCausalView(nodesData);

    this.nodesCreateRemoveManager = new NodesCreateRemoveManager(
      this.structure,
      this.causesChangeManager,
      () => this.dataManager.getCurrentCausalModelFactValueTemplate()
    );

    this.#initDialogs();

    this.#eventHandlers.causalModelSelected = this.onCausalModelSelected.bind(this);
    eventBus.on("causalModelSelected", this.#eventHandlers.causalModelSelected);
  }

  destroy() {
    // Todo: implement unsubscription fully to support causal view recreation
    eventBus.off("causalModelSelected", this.#eventHandlers.causalModelSelected);
  }

  reset(nodesData) {
    this.structure.reset(nodesData);
    this.structure.setInitialZoom();
  }

  #initDialogs() {
    this.declaredBlockDialog = new DeclaredBlockDialog(
      "declared-block-modal",
      this.onDeclareBlockClicked.bind(this),
      this.dataManager
    );
    this.declaredBlockDialog.init();
  }

  onCausalModelSelected({ causalModelName }) {
    if (!causalModelName) {
      console.error("Selected causal model is not defined. causalModelName: ", causalModelName);
    }
    // Apply unsaved data from the causal view to the causal bundle
    this.dataManager.applyUnsavedChanges();

    const selectedCausalModel =
      this.dataManager.projectData.getCausalModel(causalModelName);
    const causalViewData = CausalViewDataUtils.factsAndNodesDataToCausalViewData(selectedCausalModel);
    this.causalViewDataManager.causalModelName = causalModelName;

    this.reset(causalViewData);
  }

  onDeclareBlockClicked({
    blockNodePosX,
    blockNodePosY,
    declaredBlockId,
    blockConvention,
    blockCausesConvention
  }) {
    const nodeData = {
      block: this.declareBlockHelper.createBlock({
        declaredBlockId,
        blockConvention,
        blockCausesConvention
      }),
    };

    this.undoRedoManager.execute(
      this.nodesCreateRemoveManager.getCreateNodeCommand(
        blockNodePosX,
        blockNodePosY,
        nodeData
      )
    );
  }

  #initNodesApiCallbacks() {
    this.api.onCreateNode((event, data) => {
      this.undoRedoManager.execute(
        this.nodesCreateRemoveManager.getCreateNodeCommand(data.x, data.y)
      );
    });
    this.api.onDeclareBlock((event, data) => {
      this.declaredBlockDialog.show({
        blockNodePosX: data.x,
        blockNodePosY: data.y,
      });
    });
    this.api.onRemoveNode((event, data) => {
      this.undoRedoManager.execute(
        this.nodesCreateRemoveManager.getRemoveNodeCommand(data.x, data.y)
      );
    });
  }

  #initEnterLeaveView(selector) {
    const causalView = (this.component = d3.select(selector));
    causalView.on("mouseenter", () => api.sendCausalViewEnter());
    causalView.on("mouseleave", () => api.sendCausalViewLeave());
  }

  #initCausalView(nodesData) {
    this.structure = new CausalView(this.undoRedoManager);
    this.#initEnterLeaveNode();

    this.#initSelection();
    this.#initResetBehaviour();

    this.structure.init(this.component, nodesData, this.selectionManager);
  }

  #initEnterLeaveNode() {
    this.structure.addEventListener("nodeEnter", () =>
      this.api.sendNodeEnter()
    );
    this.structure.addEventListener("nodeLeave", () =>
      this.api.sendNodeLeave()
    );
  }

  #initSelection() {
    this.selectionManager = new CausalViewSelectionManager(
      this.api,
      this.undoRedoManager
    );

    this.selectionManager.init(this.structure);
  }

  #initResetBehaviour() {
    this.api.onReset((event, data) => {
      this.selectionManager.reset();
    });
  }
}
