import { ProjectView } from "../../components/project-view/project-view";
import { ProjectViewManager } from "../../components/project-view/project-view-manager";

export function createProjectView(
  {
    api,
    dataManager,
  }, container) {
  const projectView = new ProjectView(container.element, dataManager);
  projectView.init();
  const projectViewManager = new ProjectViewManager({
    projectView,
    api,
    dataManager
  });
}
