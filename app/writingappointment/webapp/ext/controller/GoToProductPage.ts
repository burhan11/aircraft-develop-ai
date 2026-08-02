import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import Context from "sap/ui/model/odata/v4/Context";
import MessageToast from "sap/m/MessageToast";
import Container from "sap/ushell/Container";

/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export async function GoToProductPage(
  this: ExtensionAPI,
  pageContext: Context
) {
  const Navigation = await Container.getServiceAsync("Navigation");

  await (Navigation as any).navigate({
    target: {
      semanticObject: "Products",
      action: "display",
    },
  });
}
