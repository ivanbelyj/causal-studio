import { CausalModelUtils } from "../causal-view/causal-model-utils.js";
import { CausalViewNodeUtils } from "../causal-view/render/causal-view-node-utils.js";

// When some node edges (causes) are added/changed/removed in external code,
// they must be updated in causal-view manually because d3 tracks only flat data,
// not nested and mutating.
// Provided methods must be called when adding/changing/removing cause ids
// in external code to update causal-view
export class CausesChangeManager {
  constructor(causalView) {
    this.causalView = causalView;
  }

  // reset(causalModelFact) {
  //   this.causalModelFact = causalModelFact;
  // }

  // It's ok that some of the passed causes already exist in the causal-view,
  // unlike onCausesRemove.
  // They will be ignored
  onCausesAdd(nodeData, causeIdsToAdd) {
    const nodeId = CausalViewNodeUtils.getNodeId(nodeData);
    if (!nodeId || typeof nodeId != "string") throw new Error("node id can't be ", nodeId);
    for (const addedCauseId of causeIdsToAdd) {
      if (!addedCauseId)
        throw new Error("addedCauseId cannot be ", addedCauseId);

      const curLink = this.causalView.structure.getLinkBySourceAndTargetIds(
        addedCauseId,
        nodeId
      );

      // console.log(
      //   "curLink",
      //   curLink,
      //   "from",
      //   addedCauseId,
      //   "to",
      //   causalFact.id
      // );
      if (!curLink) {
        this.causalView.structure.addLink(addedCauseId, nodeId);
      } else {
        // The link already exists in the causal-view
      }
    }
    this.causalView.structure.render();
  }

  onCausesExpressionAdd(nodeData, exprToAdd) {
    // Pass added causes to update causal-view
    this.onCausesAdd(nodeData, CausalModelUtils.findCauseIds(exprToAdd));
  }

  // !!! It is assumed that removeCauseIds are already removed from causalFact
  onCausesRemoved(nodeData, removedCauseIds) {
    if (!nodeData) throw new Error("node data can't be ", nodeData);
    for (const removedId of this.getCauseIdsToRemove(
      nodeData,
      removedCauseIds
    )) {
      this.causalView.structure.removeLink(
        removedId,
        CausalViewNodeUtils.getNodeId(nodeData));
    }
    this.causalView.structure.render();
  }

  onCauseIdChanged(nodeData, oldId, newId) {
    if (oldId) this.onCausesRemoved(nodeData, [oldId]);
    if (newId) this.onCausesAdd(nodeData, [newId]);
  }

  onCausesExpressionRemoved(nodeData, expr) {
    // Pass removed causes to update causal-view
    this.onCausesRemoved(nodeData, CausalModelUtils.findCauseIds(expr));
  }

  // - Some edges on causal-view can mean several causes at once
  //   so the edge should be removed only if it's used by removed causes only
  // !!! It is assumed that removeIds are already removed from causalFact
  getCauseIdsToRemove(nodeData, removedCauseIds) {
    // There are no removed cause ids in the causal model fact
    const causeIdsNotToRemove = CausalModelUtils.getCausesIdsUnique(nodeData);

    // But some cause ids from causeIdsNotToRemove
    // could be also in removed edges

    return CausalModelUtils.arrayComplement(
      removedCauseIds,
      causeIdsNotToRemove
    );
  }
}
