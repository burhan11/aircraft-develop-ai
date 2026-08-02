import Integer from "sap/ui/model/type/Integer";
import { VariantStatus } from "../../utils/enums/ProductStatus";
import { UUID } from "node:crypto";

export default class VariantDetails {
    public variantID: UUID = `${"0000"}-${"0000"}-${"0000"}-${"0000"}-${"0000"}`;
    public variantPath: string = "";
    public isInEditMode: boolean = false;
    public variantStatus: Array<any> = [
        { ID: VariantStatus.InProgress, name: "In Bearbeitung" },
        { ID: VariantStatus.NewSupplierProduct, name: "Neuer Lieferantenartikel" },
        { ID: VariantStatus.ToCheck, name: "Zur Prüfung" },
        { ID: VariantStatus.RequestedToSAP, name: "Anfrage SAP-Anlage" },
        { ID: VariantStatus.CreationFailed, name: "Anlage fehlgeschlagen" },
        { ID: VariantStatus.CreatedInSAP, name: "In SAP angelegt" },
        { ID: VariantStatus.MarkedForDeletion, name: "Zur Löschung markieren" },
        { ID: VariantStatus.ReleasedForSupplier, name: "Für Lieferant freigegeben" },
        { ID: VariantStatus.PartiallyCreatedInSAP, name: "Nicht vollständig in ERP erstellt" }
    ];
    public selectedVariantStatus: String = VariantStatus.InProgress;
    public basicDataLabel: String = "";
    public selectedDeliveryDate: Date;
}