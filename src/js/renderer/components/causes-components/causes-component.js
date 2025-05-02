import { CausesItem } from "./causes-item.js";
import { CausesExpressionProvider } from "../providers/causes-expression-provider.js";
import { BaseCausesComponent } from "./base-causes-component.js";


export class CausesComponent extends BaseCausesComponent {
  shouldHandleReset(nodeData) {
    return !!(nodeData.fact);
  }

  render(nodeData) {
    const rootCausesExpr = nodeData.fact.causesExpression;
    const rootCausesItem = new CausesItem({
      selector: this.content.node(),
      isRemovable: false,
      isRoot: true,
      rootCausesExpression: rootCausesExpr,
      causalView: this.causalView,
      causesExpressionProvider: new CausesExpressionProvider(
        this.undoRedoManager,
        this.causesChangeManager,
        nodeData
      ),
      blockConventionsProvider: this.blockConventionsProvider
    });
    rootCausesItem.resetProvider(rootCausesExpr);
  }
}
