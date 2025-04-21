export class CausalModelUtils {
  static findCauseIds(obj) {
    let edgeProps = new Set();
    for (let prop in obj) {
      if (prop === "edge") {
        if (
          obj[prop].hasOwnProperty("causeId") &&
          obj[prop].causeId &&
          !edgeProps.has(obj[prop]["causeId"])
        )
          edgeProps.add(obj[prop]["causeId"]);
      }
      if (typeof obj[prop] === "object") {
        const nestedEdgeProps = CausalModelUtils.findCauseIds(obj[prop]);
        // for (const nestedEdgeProp in nestedEdgeProps) {
        //   if (!edgeProps.has(nestedEdgeProp)) edgeProps.add(nestedEdgeProp);
        // }
        edgeProps = new Set(Array.from(edgeProps).concat(nestedEdgeProps));
      }
    }
    return [...edgeProps];
  }

  // static traverseInnerExpressions(obj, func) {
  //   for (let prop in obj) {
  //     if (
  //       ["operands", "edge"].find(
  //         (exprProp) => obj[prop] && obj[prop].hasOwnProperty(exprProp)
  //       )
  //     )
  //       func(obj[prop]);

  //     if (typeof obj[prop] === "object") {
  //       CausalModelUtils.traverseInnerExpressions(obj[prop], func);
  //     }
  //   }
  // }

  static getWeightsEdgesIds(causalModelFact) {
    const weightEdges = causalModelFact.weights;
    if (!weightEdges) return [];
    const idsSet = new Set();
    for (const weightEdge of weightEdges) {
      const id = weightEdge.causeId;
      if (!idsSet.has(id) && id) {
        idsSet.add(id);
      }
    }
    return [...idsSet];
  }

  static getCausesIdsUnique(nodeData) {
    let idsAll;
    if (nodeData.fact) {
      idsAll = CausalModelUtils.#getCauseIdsForFact(nodeData.fact);
    }
    if (nodeData.block) {
      idsAll = CausalModelUtils.#getCauseIdsForBlock(nodeData.block);
    }

    return [...new Set(idsAll)];
  }

  static #getCauseIdsForFact(causalModelFact) {
    const idsAll = [
      ...CausalModelUtils.findCauseIds(causalModelFact.causesExpression),
      ...CausalModelUtils.getWeightsEdgesIds(causalModelFact),
    ];
    if (causalModelFact.abstractFactId)
      idsAll.push(causalModelFact.abstractFactId);
    return idsAll;
  }

  static #getCauseIdsForBlock(declaredBlock) {
    return Object.values(declaredBlock.blockCausesMap);
  }

  // Edges are identified by source and target ids
  static sourceAndTargetIdsToEdgeId(source, target) {
    // encodeURIComponents for spaces, hope id doesn't have a `--` in it
    return encodeURIComponent(`edge-${source}--${target}`);
  }

  static getNodeIdClassNameByNodeId(nodeId) {
    return `node-${nodeId}`;
  }

  static createFactorExpression() {
    return {
      $type: "factor",
      edge: {
        probability: 1,
      },
    };
  }

  static lastCreatedFactNumber = 0;
  static createNewFactWithFactor() {
    return {
      id: null,
      causesExpression: {
        $type: "factor",
        edge: {
          probability: 1,
        },
      },
      factValue: `New Fact ${++CausalModelUtils.lastCreatedFactNumber}`,
    };
  }

  static arrayComplement(minuend, subtrahend) {
    return minuend.filter((x) => x && !subtrahend.includes(x));
  }

  static causesExpressionComplement(minuendExpr, subtrahendExpr) {
    const minCausesIds = CausalModelUtils.findCauseIds(minuendExpr);
    const subCausesIds = CausalModelUtils.findCauseIds(subtrahendExpr);
    return CausalModelUtils.arrayComplement(minCausesIds, subCausesIds);
  }

  static factComplement(minuendFact, subtrahendFact) {
    // TODO: use node data, not fact
    const minCausesIds = CausalModelUtils.getCausesIdsUnique(minuendFact);
    const subCausesIds = CausalModelUtils.getCausesIdsUnique(subtrahendFact);
    return CausalModelUtils.arrayComplement(minCausesIds, subCausesIds);
  }
}
