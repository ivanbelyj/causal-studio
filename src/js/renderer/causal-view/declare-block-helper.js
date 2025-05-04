export class DeclareBlockHelper {
  createBlock({ declaredBlockId, blockConvention, blockCausesConvention }) {
    return {
      id: declaredBlockId,
      convention: blockConvention,
      causesConvention: blockCausesConvention,
      blockCausesMap: {},
      blockConsequencesMap: {},
    };
  }
}
