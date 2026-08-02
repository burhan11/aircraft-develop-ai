import Integer from "sap/ui/model/type/Integer";
import { ProductStatus } from "../../utils/enums/ProductStatus";
import { UUID } from "node:crypto";

export default class ProductDetails {
    public productID: UUID = `${"0000"}-${"0000"}-${"0000"}-${"0000"}-${"0000"}`;
    // public productID: string = "";
    public productPath: string = "";
    // public productToPurchPath: string = "";
    // public productToSalesPath: string = "";
    public isInEditMode: boolean = false;
    public productStatus: Array<any> = [
        { ID: ProductStatus.InProgress, name: "In Bearbeitung" },
        { ID: ProductStatus.NewSupplierProduct, name: "Neuer Lieferantenartikel" },
        { ID: ProductStatus.ToCheck, name: "Zur Prüfung" },
        { ID: ProductStatus.RequestedToSAP, name: "Anfrage SAP-Anlage" },
        { ID: ProductStatus.CreationFailed, name: "Anlage fehlgeschlagen" },
        { ID: ProductStatus.CreatedInSAP, name: "In SAP angelegt" },
        { ID: ProductStatus.MarkedForDeletion, name: "Zur Löschung markieren" },
        { ID: ProductStatus.ReleasedForSupplier, name: "Für Lieferant freigegeben" },
        { ID: ProductStatus.PartiallyCreatedInSAP, name: "Nicht vollständig in ERP erstellt" }
    ];
    public selectedProductStatus: String = ProductStatus.InProgress;
    public basicDataLabel: String = "";
    public selectedDeliveryDate: Date;
}