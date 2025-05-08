export default class MenuTemplateUtils {
  static #createComponentToggleItem({
    menuActionHelper,
    componentType,
    isActive,
  }) {
    return {
      label: componentType,
      type: "checkbox",
      checked: isActive,
      // When toggled golden-layout component via menu
      click: function (menuItem, browserWindow, event) {
        // The component will be set in the renderer process
        menuActionHelper.sendMessage("set-component-active", {
          componentType,
          isActive: menuItem.checked,
        });
      },
    };
  }

  static createComponentMenuItems({
    menuActionHelper,
    registeredComponentTypes,
    activeComponentTypes,
  }) {
    const componentMenuItems = [];
    for (const [componentType, componentData] of registeredComponentTypes) {
      componentMenuItems.push(MenuTemplateUtils.#createComponentToggleItem({
        menuActionHelper,
        componentType,
        isActive: activeComponentTypes.has(componentType),
      }));
    }
    return componentMenuItems;
  }
}
