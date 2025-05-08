import { FactValueTransformerComponent } from "../../components/fact-value-transformer/fact-value-transformer-component";

export function createFactValueTransformerComponent(args, container) {
    const { api, dataManager, componentsContext } = args;
    console.log(componentsContext.causalView.structure);

    const component = new FactValueTransformerComponent(
        container.element,
        api,
        dataManager,
        componentsContext.causalView.structure,

    );

    component.init();
}