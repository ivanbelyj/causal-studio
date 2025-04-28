import { FixationResultsComponent } from "../../components/fixation-results/fixation-results-component";

export function createFixationResultsComponent(args, container) {
    Object.assign(this, args);

    new FixationResultsComponent(
        container.element,
        this.api);
}