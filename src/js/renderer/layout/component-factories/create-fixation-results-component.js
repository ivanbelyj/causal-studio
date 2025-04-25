import { FixationResultsComponent } from "../../components/fixation-results/fixation-results-component";

export function createFixationResultsComponent(container) {
    new FixationResultsComponent(
        container.element,
        this.api);
}