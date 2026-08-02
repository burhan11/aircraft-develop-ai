import Integer from "sap/ui/model/type/Integer";
import { ArticleStatus } from "../../utils/enums/ProductStatus";
import { UUID } from "node:crypto";

export default class ArticleDetails {
    public articleID: UUID = `${"0000"}-${"0000"}-${"0000"}-${"0000"}-${"0000"}`;
    // public articleID: string = "";
    public articlePath: string = "";
    // public articleToPurchPath: string = "";
    // public articleToSalesPath: string = "";
    public isInEditMode: boolean = false;
    public articleStatus: Array<any> = [
        { ID: ArticleStatus.InProgress, name: "In Bearbeitung" },
        { ID: ArticleStatus.NewSupplierProduct, name: "Neuer Lieferantenartikel" },
        { ID: ArticleStatus.ToCheck, name: "Zur Prüfung" },
        { ID: ArticleStatus.RequestedToSAP, name: "Anfrage SAP-Anlage" },
        { ID: ArticleStatus.CreationFailed, name: "Anlage fehlgeschlagen" },
        { ID: ArticleStatus.CreatedInSAP, name: "In SAP angelegt" },
        { ID: ArticleStatus.MarkedForDeletion, name: "Zur Löschung markieren" },
        { ID: ArticleStatus.ReleasedForSupplier, name: "Für Lieferant freigegeben" },
        { ID: ArticleStatus.PartiallyCreatedInSAP, name: "Nicht vollständig in ERP erstellt" }
    ];
    public selectedArticleStatus: String = ArticleStatus.InProgress;
    public basicDataLabel: String = "";
    public selectedDeliveryDate: Date;
}