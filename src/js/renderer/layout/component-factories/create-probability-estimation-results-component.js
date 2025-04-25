import { ProbabilityEstimationResultsComponent } from "../../components/probability-estimation-results/probability-estimation-results-component";

export function createProbabilityEstimationResultsComponent(container) {
    new ProbabilityEstimationResultsComponent(
        container.element,
        this.api);
}