import * as d3 from "d3";
import ColorUtils from "../../common/color-utils";

export class ProbabilityEstimationResultsProvider {
    // Key is modelName_factId
    #probabilityEstimationResultsByFactKey;

    #showProbabilityEstimationResults;
    #currentCausalModelName;

    get showProbabilityEstimationResults() {
        return this.#showProbabilityEstimationResults;
    }

    set showProbabilityEstimationResults(value) {
        this.#showProbabilityEstimationResults = value;
    }

    get probabilityEstimationResultsByFactKey() {
        return this.#probabilityEstimationResultsByFactKey;
    }

    getProbabilityDataByFactId(factId) {
        return this.#probabilityEstimationResultsByFactKey?.get(
            this.#getFactKey(this.currentCausalModelName, factId));
    }

    get currentCausalModelName() {
        return this.#currentCausalModelName;
    }

    set currentCausalModelName(value) {
        this.#currentCausalModelName = value;
    }

    resetProbabilitiesVisualization() {
        this.showProbabilityEstimationResults = false;
        this.probabilityEstimationResults = null;
    }

    getProbabilityColor(probability) {
        return ColorUtils.getProbabilityColor(probability);
    }

    getFactProbabilityColor(factId) {
        const probabilityData = this.getProbabilityDataByFactId(factId);
        if (!probabilityData
            || probabilityData.estimatedProbability === undefined
            || probabilityData.estimatedProbability === null) {
            return null;
        }
        return this.getProbabilityColor(probabilityData.estimatedProbability);
    }

    setProbabilityEstimationResults(probabilityEstimationResults) {
        if (!probabilityEstimationResults) {
            this.#probabilityEstimationResultsByFactKey = null;
            return;
        }

        this.#probabilityEstimationResultsByFactKey = new Map();
        for (const [modelName, factsData] of Object.entries(probabilityEstimationResults.factsInfoByModelName)) {
            for (const [factId, factProbabilityData] of Object.entries(factsData)) {
                this.#probabilityEstimationResultsByFactKey.set(
                    this.#getFactKey(modelName, factId),
                    factProbabilityData);
            }
        }
    }

    #getFactKey(modelName, factId) {
        return `${modelName}_${factId}`;
    }
}