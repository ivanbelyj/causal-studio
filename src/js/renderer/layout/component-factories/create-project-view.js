import { ProjectView } from "../../components/project-view/project-view";
import { ProjectViewManager } from "../../components/project-view/project-view-manager";

export function createProjectView(container) {
  const projectView = new ProjectView(container.element, this.dataManager);
  projectView.init();
  const projectViewManager = new ProjectViewManager({
    projectView,
    api: this.api,
    dataManager: this.dataManager,
  });
}
