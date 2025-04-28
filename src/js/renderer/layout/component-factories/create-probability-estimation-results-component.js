import { ProbabilityEstimationResultsComponent } from "../../components/probability-estimation-results/probability-estimation-results-component";

export function createProbabilityEstimationResultsComponent(args, container) {
    Object.assign(this, args);

    new ProbabilityEstimationResultsComponent(
        container.element,
        this.api);
}