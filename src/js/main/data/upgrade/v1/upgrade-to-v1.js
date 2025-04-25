import UpgradeToV1Utils from "./upgrade-to-v1-utils";

/**
 * Upgrades causal-studio data from v0 to v1
 */
export class UpgradeToV1 {
  upgradeProjectData(projectData) {
    projectData = this.#upgradeCore(projectData);
    return projectData;
  }
  upgradeCausalModel(causalModel) {
    causalModel = this.#upgradeCore(causalModel);
    return causalModel;
  }

  #upgradeCore(data) {
    data = UpgradeToV1Utils.convertKeysToCamelCase(data);
    data = this.#upgradeFacts(data);
    return data;
  }

  #upgradeFacts(data) {
    return { ...data, facts: this.#getUpgradedFacts(data.facts) };
  }

  #getUpgradedFacts(facts) {
    return facts.map((fact) => {
      fact = UpgradeToV1Utils.removeProbabilityNest(fact);
      fact = UpgradeToV1Utils.removeWeightNest(fact);
      fact = UpgradeToV1Utils.removeTypeVariantProperty(fact);
      return UpgradeToV1Utils.renamePropertiesToV1(fact);
    });
  }
}
