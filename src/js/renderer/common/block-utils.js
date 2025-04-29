export default class BlockUtils {
    static getBlockCauseNames(blockCausesConventions, causesConventionName) {
        const blockCauses = blockCausesConventions
            .find(x => x.name === causesConventionName)
            ?.causes;
        return blockCauses ?? [];
    }

    static getBlockConsequenceNames(blockConventions, conventionName) {
        const blockConsequences = blockConventions
            .find(x => x.name === conventionName)
            ?.consequences;
        return blockConsequences ?? [];
    }
}