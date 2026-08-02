using {
    managed,
    sap,
    cuid
} from '@sap/cds/common';

using {com.valantic.preorder.common.helper.topic} from '../common/helper/topic';
using {com.valantic.preorder.common} from '../common/supplier';
using {com.valantic.preorder.common.helper.classification} from '../common/helper/classification';
using {com.valantic.preorder.common.product} from '../common/product';
using {com.valantic.preorder.common.helper.logistic} from '../common/helper/logistic';
using {com.valantic.preorder.common.helper.method} from '../common/helper/method';
using {com.valantic.preorder.writingAppointments} from '../writing-appointment/schema';
using {com.valantic.preorder.planning} from '../pre-order-volume-planning/schema';
using {com.valantic.preorder.common.helper.reuse} from '../common/helper/reuse';
using {
    WRF_CHARVAL,
    ZSTTA_SUP_TYPE,
    PRODUCTION_PLANT,
    WAKH,
    WRF_PSCD_TCHAINH

} from '../synced/sap-ecc-schema';

namespace com.valantic.preorder.product;

@cds.autoexpose
entity ProductStatus {
    key ID          : String enum {
            InProgress;
            NewSupplierProduct;
            ToCheck;
            RequestedToSAP;
            CreationFailed;
            CreatedInSAP;
            MarkedForDeletion;
            ReleasedForSupplier;
            PartiallyCreatedInSAP
        };
        name        : localized String;
        Criticality : Integer;
};


entity Qualities         as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'QUALITAET';


entity Omnichannels      as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'OMNICHANNEL';


entity SurfaceWashings   as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'OBERFLAECHE-WASCHUNG';


entity MainForms         as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'FORM-HAUPT';


entity StockingThickness as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'WEBART-STRUMPFSTAERKE';


entity Occasions         as
    select
        CODE,
        DESCRIPTION
    from WRF_CHARVAL
    where
        ATNAM = 'ANLASS';


entity Properties        as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'EIGENSCHAFT';


entity Licenses          as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'LIZENZ';


entity PresentationTypes as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'PRAESENTATIONSART';

entity Modules           as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'MODUL';


entity Sizes             as
    select
        CODE,
        DESCRIPTION,
        SRTPO
    from WRF_CHARVAL
    where
        ATNAM = 'GROESSE1';

// entity Products : managed {
//     key ID                              : UUID;
//         name                            : String;
//         description                     : String;
//         status                          : Association to one ProductStatus                           @title: 'Status'                     @assert.integrity;
//         //BASIC
//         supplier                        : Association to one LFA1                                    @title: 'BBN'                        @assert.integrity;
//         consumerTopic                   : Association to one WRF_MATGRP_STRCT_KT                     @title: 'KT'                         @assert.integrity;
//         brand                           : Association to one WRF_BRANDS                              @title: 'Marke'                      @assert.integrity;
//         topicComponent                  : Association to one WRF_MATGRP_STRCT_TBS                    @title: 'TBS'                        @assert.integrity;
//         assortmentModule                : Association to one WRF_MATGRP_STRCT_SBS                    @title: 'SBS'                        @assert.integrity;
//         productGroup                    : Association to one T023T                                   @title: 'WGR'                        @assert.integrity;
//         targetGroup                     : Association to one ZSTTA_ZIELGR_T                          @title: 'Zielgruppe'                 @assert.integrity;
//         module                          : Association to one Modules                                 @title: 'Modul'                      @assert.integrity; //WRF_CHARVAL

//         //IDENTIFICATION
//         supplierProductNumber           : String                                                     @title: 'Lieferanten Artikelnummer';
//         supplierProductNumberVariant    : String                                                     @title: 'Lieferanten Artikelnummer Variante';
//         productText                     : String                                                     @title: 'Artikel-Kurztext';
//         supplierProductName             : String                                                     @title: 'Lieferanten Artikelname';
//         receiptText                     : String                                                     @title: 'Bontext';
//         supplierColor                   : String                                                     @title: 'Lieferanten Farbe';
//         evaluationColor                 : Association to one product.EvaluationColors                @title: 'Auswertefarbe'              @assert.integrity;
//         sizeSystem                      : Association to one ZSTTA_GROE_SYS                          @title: 'Größensystem'               @assert.integrity;
//         size1                           : Association to one Sizes                                   @title: 'Größe 1'                    @assert.integrity; //WRF_CHARVAL
//         size2                           : Association to one Sizes                                   @title: 'Größe 2'                    @assert.integrity; //WRF_CHARVAL
//         sizeRun                         : String                                                     @title: 'Größenlauf';
//         GTIN                            : String                                                     @title: 'GTIN';
//         supplyType                      : Association to one ZSTTA_SUP_TYPE                          @title: 'SupplyType'                 @assert.integrity;
//         seasonType                      : Association to one classification.SeasonTypes              @title: 'Saison'                     @assert.integrity;
//         seasonYear                      : String                                                     @title: 'Saisonjahr';
//         presentationType                : Association to one PresentationTypes                       @title: 'Präsentationsart'           @assert.integrity; //WRF_CHARVAL
//         availableFrom                   : Date                                                       @title: 'Lieferbar ab';
//         availableUntil                  : Date                                                       @title: 'Lieferbar bis';
//         endOfLifeCycle                  : Date                                                       @title: 'Ende Lebenszyklus';

//         //NEW PURCHASE
//         currency                        : Association to one logistic.Currencies                     @title: 'Währung'                    @assert.integrity;
//         vat                             : Association to one classification.VATs                     @title: 'MwSt'                       @assert.integrity;
//         purchasePrice                   : Decimal(15, 2)                                             @title: 'Einkaufspreis €/$ B';
//         purchaseFactor                  : Decimal(15, 2)                                             @title: 'EK  US$ / Faktor';
//         purchasePriceUSD                : Decimal(15, 2)                                             @title: 'Einkaufspreis US$';
//         purchasePriceEURNetto           : Decimal(15, 2)                                             @title: 'Einkaufspreis final Netto €';
//         productDiscount1                : Decimal(15, 2)                                             @title: 'Artikelrabatt 1';
//         productDiscount2                : Decimal(15, 2)                                             @title: 'Artikelrabatt 2';
//         productDiscount3                : Decimal(15, 2)                                             @title: 'Artikelrabatt 3';

//         //NEW SALES
//         retailPrice                     : Decimal(15, 2)                                             @title: 'Verkaufspreis';
//         currentPrice                    : Decimal(15, 2)                                             @title: 'Streichpreis/Aktueller Preis';
//         uvpType                         : Association to one classification.UVPTypes                 @title: 'UVP Typ'                    @assert.integrity;
//         uvpPrice                        : Decimal(15, 2)                                             @title: 'UVP Preis';

//         //PURCHASE
//         /* GPOPT-1175: Remove valid range in purchase and sales data
//         to_Purchase                     : Composition of many {
//                                               key ID                    : UUID;
//                                                   validFrom             : Date                                    @title: 'gültig ab';
//                                                   validTo               : Date                                    @title: 'gültig bis';
//                                                   currency              : Association to one logistic.Currencies  @title: 'Währung'  @assert.integrity;
//                                                   vat                   : Association to one classification.VATs  @title: 'MwSt'     @assert.integrity;
//                                                   purchasePrice         : Decimal(15, 2)                          @title: 'Einkaufspreis €/$ B';
//                                                   purchaseFactor        : Decimal(15, 2)                          @title: 'EK  US$ / Faktor';
//                                                   purchasePriceUSD      : Decimal(15, 2)                          @title: 'Einkaufspreis US$';
//                                                   purchasePriceEURNetto : Decimal(15, 2)                          @title: 'Einkaufspreis final Netto €';
//                                                   productDiscount1      : Decimal(15, 2)                          @title: 'Artikelrabatt 1';
//                                                   productDiscount2      : Decimal(15, 2)                          @title: 'Artikelrabatt 2';
//                                                   productDiscount3      : Decimal(15, 2)                          @title: 'Artikelrabatt 3';
//                                           }

//         //RETAIL
//         to_Sales                        : Composition of many {
//                                               key ID           : UUID;
//                                                   validFrom    : Date                                        @title: 'gültig von';
//                                                   validTo      : Date                                        @title: 'gültig bis';
//                                                   retailPrice  : Decimal(15, 2)                              @title: 'Verkaufspreis';
//                                                   currentPrice : Decimal(15, 2)                              @title: 'Streichpreis/Aktueller Preis';
//                                                   uvpType      : Association to one classification.UVPTypes  @title: 'UVP Typ'  @assert.integrity;
//                                                   uvpPrice     : Decimal(15, 2)                              @title: 'UVP Preis';
//                                           }
//                                         */

//         //CLASSIFICATION
//         sapNumber                       : String                                                     @title: 'SAP Nummer';
//         //lotNumber                       : String                                            @title: 'Lot Nummer';
//         pricatCatalog                   : Association to one PRICAT_K001                             @title: 'Pricat Katalog'             @assert.integrity;
//         productType                     : Association to one classification.ProductTypes             @title: 'Artikeltyp'                 @assert.integrity;
//         ownershipStatus                 : Association to one logistic.OwnershipStatus                @title: 'Konsi-Steuerung'            @assert.integrity;
//         gridBox                         : Association to one classification.NineGridBoxes            @title: '9-Grid-Box'                 @assert.integrity;
//         omnichannel                     : Association to one Omnichannels                            @title: 'Omnichannel'                @assert.integrity;

//         //OTHER
//         shippingInstruction             : Association to one logistic.ShippingInstructions           @title: 'Versandvorschrift'          @assert.integrity;
//         material1                       : Association to product.Materials                           @title: 'Material 1 Code'            @assert.integrity;
//         portion1                        : Integer                                                    @title: 'Material 1 %';
//         material2                       : Association to product.Materials                           @title: 'Material 2 Code'            @assert.integrity;
//         portion2                        : Integer                                                    @title: 'Material 2 %';
//         material3                       : Association to product.Materials                           @title: 'Material 3 Code'            @assert.integrity;
//         portion3                        : Integer                                                    @title: 'Material 3 %';
//         material4                       : Association to product.Materials                           @title: 'Material 4 Code'            @assert.integrity;
//         portion4                        : Integer                                                    @title: 'Material 4 %';
//         material5                       : Association to product.Materials                           @title: 'Material 5 Code'            @assert.integrity;
//         portion5                        : Integer                                                    @title: 'Material 5 %';
//         shippingPort                    : Association to one logistic.ShippingPorts                  @title: 'Versandhafen'               @assert.integrity;
//         productionPlant                 : Association to one T001W                                   @title: 'Produktionsstätte'          @assert.integrity;
//         differingIncoTerm               : Association to one logistic.IncoTerms                      @title: 'Abweichender Incoterm'      @assert.integrity;

//         //LABELS
//         mainLabel                       : Association to one MARA                                    @title: 'Main Label'                 @assert.integrity;
//         subLabel                        : Association to one MARA                                    @title: 'Sub Label'                  @assert.integrity;
//         sizeLabel                       : Association to one MARA                                    @title: 'Size Label'                 @assert.integrity;
//         sizeCode                        : Association to one MARA                                    @title: 'Size Code'                  @assert.integrity;
//         hangTag                         : Association to one MARA                                    @title: 'Hang Tag'                   @assert.integrity;
//         stringWithSeal                  : Association to one MARA                                    @title: 'String with Seal'           @assert.integrity;
//         priceSticker                    : Association to one MARA                                    @title: 'Price Sticker'              @assert.integrity;
//         careLabel                       : Association to one MARA                                    @title: 'Care Label'                 @assert.integrity;
//         addHangTag                      : Association to one MARA                                    @title: 'Add. Hang Tag'              @assert.integrity;

//         //NEW TO BE CHECKED
//         houseGroup                      : Association to one logistic.HouseGroups                    @title: 'Hausgruppe';
//         costOfGoodsCalculation          : String                                                     @title: 'WE Kalkulation';
//         lotCreation                     : Boolean                                                    @title: 'Lot- oder Displayanlage';
//         priceLevel                      : Association to one classification.PriceLevels default '00' @title: 'Ebene Preisartikel';
//         onlineSalesFrom                 : Date                                                       @title: 'Verkauf ab für Online';
//         series                          : Association to one ZBMTA0081_SERIE                         @title: 'Serie'                      @assert.integrity;
//         license                         : Association to one Licenses                                @title: 'Lizenz'                     @assert.integrity;
//         program                         : Association to one T6WFGT                                  @title: 'Programm'                   @assert.integrity;
//         occasion                        : Association to one Occasions                               @title: 'Anlass'                     @assert.integrity; //WRF_CHARVAL
//         property                        : Association to one Properties                              @title: 'Eigenschaft'                @assert.integrity; //WRF_CHARVAL
//         quality                         : Association to one Qualities                               @title: 'Qualität'                   @assert.integrity; //WRF_CHARVAL
//         pattern                         : Association to one ZSTTA_MUSTER_T                          @title: 'Muster';
//         specialProduct                  : Association to one ZSTTA_SONDERARTT                        @title: 'Sonderartikel';
//         surfaceWashing                  : Association to one SurfaceWashings                         @title: 'Oberflächenwaschung'        @assert.integrity; //WRF_CHARVAL
//         mainForm                        : Association to one MainForms                               @title: 'Formhaupt'                  @assert.integrity; //WRF_CHARVAL
//         stockingThickness               : Association to one StockingThickness                       @title: 'Strumpfstärke'              @assert.integrity; //WRF_CHARVAL
//         basicDataText                   : String                                                     @title: 'Grunddatentext';
//         purchaseOrderText               : String                                                     @title: 'Einkaufsbestelltext';
//         sampleSaleMethod             : Association to one MARA                                    @title: 'Musterverkauf'                                 @assert.integrity;
//         merchandiseSecurityMethod            : Association to one MARA                                    @title: 'Warensicherung'                                @assert.integrity;
//         priceLabelMethod              : Association to one MARA                                    @title: 'Preisetiketten'                                @assert.integrity;
//         hangerMethod                    : Association to one MARA                                    @title: 'Bügel'                                          @assert.integrity;
//         additionalVKHMMethod                : Association to one MARA                                    @title: 'Zusatz VKHM'                                   @assert.integrity;
//         brandLabelMethod               : Association to one MARA                                    @title: 'Marken Label'                                  @assert.integrity;
//         slsMethod                       : Association to one MARA                                    @title: 'SLS'                                           @assert.integrity;
//         attachmentMethod1               : Association to one method.AttachmentMethods                @title: 'Anbringungsmethode 1'       @assert.integrity;
//         attachmentMethod2               : Association to one method.AttachmentMethods                @title: 'Anbringungsmethode 2'       @assert.integrity;
//         attachmentMethod3               : Association to one method.AttachmentMethods                @title: 'Anbringungsmethode 3'       @assert.integrity;
//         /* GPOPT-1195
//         dispositionFeature              : String                                                     @title: 'ANV (Dispmerkmal)';
//         */
//         loadingGroup                    : Association to one logistic.LoadingGroups                  @title: 'Ladegruppe'                 @assert.integrity;
//         sustainabilitySealOfApproval    : Association to one ZSTTA_NH_GS_T                           @title: 'Nachhaltigkeit Gütesiegel'  @assert.integrity;
//         sustainabilityCertifier         : String                                                     @title: 'NH Zertifizierer';
//         sustainabilityMaterial          : String                                                     @title: 'NH Material';
//         sustainabilityPortion           : Integer                                                    @title: 'Anteil NH in %';
//         washing                         : Association to one method.WashingMethods                   @title: 'Waschen'                    @assert.integrity;
//         bleaching                       : Association to one method.BleachingMethods                 @title: 'Bleichen'                   @assert.integrity;
//         ironing                         : Association to one method.IroningMethods                   @title: 'Bügeln'                     @assert.integrity;
//         cleaning                        : Association to one method.CleaningMethods                  @title: 'Reinigung'                  @assert.integrity;
//         drying                          : Association to one method.DryingMethods                    @title: 'Trocknen'                   @assert.integrity;
//         differentUnitOfMeasureAvailable : Boolean                                                    @title: 'Abweichende Mengeneinheit';
//         differentUnitOfMeasure1         : String                                                     @title: 'Alternative-ME1';
//         differentUnitOfMeasureOut1      : String                                                     @title: 'Alternative-ME1-Lagerausgabemenge';
//         differentUnitOfMeasure2         : String                                                     @title: 'Alternative-ME2';
//         differentUnitOfMeasureOut2      : String                                                     @title: 'Alternative-ME2-Lagerausgabemenge';
//         differentUnitOfMeasure3         : String                                                     @title: 'Alternative-ME3';
//         differentUnitOfMeasureOut3      : String                                                     @title: 'Alternative-ME3-Lagerausgabemenge';
//         differentUnitOfMeasure4         : String                                                     @title: 'Alternative-ME4';
//         differentUnitOfMeasureOut4      : String                                                     @title: 'Alternative-ME4-Lagerausgabemenge';
//         onlineOrderStep                 : String                                                     @title: 'Online Bstellschritt';
//         minimumOrderQuantity            : Integer                                                    @title: 'Mindestbestellmenge Online';
//         maximumOrderQuantity            : Integer                                                    @title: 'Maximale Bestellmenge Online';
//         comment                         : String                                                     @title: 'Bemerkung';
//         /* GPOPT-1324
//         supplierProductGroup            : String                                                     @title: 'Lieferantenwarengruppe';
//         */
//         imageUrl                        : String                                                     @title: 'Bild';
//         isUploaded                      : Boolean default false                                      @UI.Hidden;

//         to_WritingAppointments          : Association to many ProductsToWritingAppointments
//                                               on to_WritingAppointments.product = $self;
//         to_Size                         : Composition of many ProductSizes
//                                               on to_Size.product = $self;
//         comment2                        : String                                                     @title: 'Bemerkung 2 (Intern)    ';
//         sustainabilityCertificateNumber : String                                                     @title: 'Zertifikatsnummer';
//         washingInstructions             : String                                                     @title: 'Waschanleitung';
//         countryOfProduction             : String                                                     @title: 'Ursprungsland';
//         purchaseGroup                   : Association to one PurchaseGroups                          @title: 'Einkäufergruppe'            @assert.integrity;
//         sapHttpStatus                   : Integer;
//         sapHttpStatusText               : String;
//         sapStatus                       : String;
//         sapStatusText                   : String;
//         sapTransactionId                : String;
//         isImported                      : Boolean default false;
//         storageLocation                 : Association to one logistic.StorageLocations               @title: 'Lagerort'                   @assert.integrity;
//         creationStatus                  : Association to one product.CreationStatus                  @title: 'Erstellungsstatus'          @assert.integrity;
//         baseUnitOfMeasure               : Association to one BaseUnitOfMeasures                      @title: 'Basiseinheit'               @assert.integrity;

//UNITS OF MEASURE
//         orderUnit                       : Association to one BaseUnitOfMeasures                      @title: 'Bestellmengeneinheit'                          @assert.integrity;
//         orderUnitConversionUnit         : Association to one BaseUnitOfMeasures                      @title: 'Umrechnungseinheit Bestellmengeneinheit'       @assert.integrity;
//         orderUnitConversionRatio        : Decimal(15, 5)                                             @title: 'Umrechnungsfaktor Bestellmengeneinheit';
//         storageUnit                     : Association to one BaseUnitOfMeasures                      @title: 'Lagerausgabemengeneinheit'                     @assert.integrity;
//         storageUnitConversionUnit       : Association to one BaseUnitOfMeasures                      @title: 'Umrechnungseinheit Lagerausgabemengeneinheit'  @assert.integrity;
//         storageUnitConversionRatio      : Decimal(15, 5)                                             @title: 'Umrechnungsfaktor Lagerausgabemengeneinheit';
//         salesUnit                       : Association to one BaseUnitOfMeasures                      @title: 'Verkaufsmengeneinheit'                         @assert.integrity;
//         salesUnitConversionUnit         : Association to one BaseUnitOfMeasures                      @title: 'Umrechnungseinheit Verkaufsmengeneinheit'      @assert.integrity;
//         salesUnitConversionRatio        : Decimal(15, 5)                                             @title: 'Umrechnungsfaktor Verkaufsmengeneinheit';
// }

entity Articles : managed, reuse.ProductFields {
    key ID                     : UUID;
        name                   : String;
        description            : String;
        status                 : Association to one ProductStatus  @title: 'Status'  @assert.integrity;
        to_Option              : Composition of many Products
                                     on to_Option.article = $self;
        to_WritingAppointments : Association to many ArticlesToWritingAppointments
                                     on to_WritingAppointments.article = $self;
}

entity Products : managed, reuse.ProductFields, reuse.ColorFields {
    key ID                     : UUID;
        name                   : String;
        description            : String;
        status                 : Association to one ProductStatus  @title: 'Status'   @assert.integrity;
        to_WritingAppointments : Association to many ProductsToWritingAppointments
                                     on to_WritingAppointments.product = $self;
        to_Size                : Composition of many ProductSizes
                                     on to_Size.product = $self;
        article                : Association to one Articles       @title: 'Artikel'  @assert.integrity;
}

entity ProductSizes : managed, reuse.ProductFields, reuse.ColorFields {
    key ID                           : UUID;
        status                       : Association to one ProductStatus  @title: 'Status'  @assert.integrity;
        size_1                       : Association to one Sizes          @assert.integrity;
        size_2                       : Association to one Sizes          @assert.integrity;
        GTIN                         : String;
        sapNumber                    : String;
        productTextVariant           : String                            @title: 'Artikel-Kurztext Variante';
        supplierProductNumberVariant : String                            @title: 'Lieferanten Artikelnummer Variante';
        to_WritingAppointments       : Association to many ProductSizesToWritingAppointments
                                           on to_WritingAppointments.productSize = $self;
        product                      : Association to one Products       @assert.integrity;
        article                      : Association to one Articles       @assert.integrity;
}

entity ProductsToWritingAppointments : managed {
    key writingAppointment   : Association to writingAppointments.WritingAppointments;
    key product              : Association to Products;
        index                : Integer;
        deliveryDateVZ       : Date                                        @title: 'Liefertermin VZ';
        deliveryDateShop     : Date                                        @title: 'Liefertermin Filiale';
        houseGroup1          : Integer;
        houseGroup2          : Integer;
        houseGroup3          : Integer;
        houseGroup4          : Integer;
        houseGroup5          : Integer;
        houseGroup6          : Integer;
        houseGroup7          : Integer;
        houseGroup8          : Integer;
        houseGroup9          : Integer;
        houseGroup10         : Integer;
        houseGroup11         : Integer;
        houseGroup12         : Integer;
        houseGroup13         : Integer;
        houseGroup14         : Integer;
        houseGroup15         : Integer;
        totalAmount          : Integer;
        totalPurchaseAmount  : Decimal(15, 2);
        sizeKey              : String;
        differingSizeKey     : String;
        differingHouseGroups : Composition of many {
                                   key houseGroup : Association to one logistic.HouseGroups;
                               };
        sizeDistribution     : Association to planning.PlanningProductsToPlanningSizes
                                   on  sizeDistribution.writingAppointment = writingAppointment
                                   and sizeDistribution.product            = product;
        incoTerm             : Association to one logistic.IncoTerms       @title: 'Incoterm'    @assert.integrity;
        supplyType           : Association to one ZSTTA_SUP_TYPE           @title: 'Supply Type'  @assert.integrity;
        productionPlant      : Association to one PRODUCTION_PLANT                    @title: 'Produktionsstätte';
        transportChain       : Association to one WRF_PSCD_TCHAINH @title: 'Transportkette';
        purchaseOrderText    : String                                      @title: 'Bestelltext';
        countryOfProduction  : String                                      @title: 'Ursprungsland';
        actionNumber         : Association to one WAKH                    @title: 'Aktionsnummer';
/*planning           : Association to one planning.Planning
         on planning.writingAppointment = writingAppointment;*/
}

entity ArticlesToWritingAppointments : managed {
    key writingAppointment : Association to writingAppointments.WritingAppointments;
    key article            : Association to Articles;
        index              : Integer;
        deliveryDateVZ     : Date @title: 'Liefertermin VZ';
        deliveryDateShop   : Date @title: 'Liefertermin Filiale';
        incoTerm           : Association to one logistic.IncoTerms  @title: 'Incoterm'    @assert.integrity;
        supplyType         : Association to one ZSTTA_SUP_TYPE      @title: 'Supply Type'  @assert.integrity;
        productionPlant    : Association to one PRODUCTION_PLANT    @title: 'Produktionsstätte';
        transportChain     : Association to one WRF_PSCD_TCHAINH    @title: 'Transportkette';
        purchaseOrderText   : String                                 @title: 'Bestelltext';
        countryOfProduction : String                                 @title: 'Ursprungsland';
        actionNumber        : Association to one WAKH                @title: 'Aktionsnummer';
}

entity ProductSizesToWritingAppointments : managed {
    key writingAppointment   : Association to writingAppointments.WritingAppointments;
    key productSize          : Association to ProductSizes;
        index                : Integer;
        deliveryDateVZ       : Date @title: 'Liefertermin VZ';
        deliveryDateShop     : Date @title: 'Liefertermin Filiale';
        houseGroup1          : Integer;
        houseGroup2          : Integer;
        houseGroup3          : Integer;
        houseGroup4          : Integer;
        houseGroup5          : Integer;
        houseGroup6          : Integer;
        houseGroup7          : Integer;
        houseGroup8          : Integer;
        houseGroup9          : Integer;
        houseGroup10         : Integer;
        houseGroup11         : Integer;
        houseGroup12         : Integer;
        houseGroup13         : Integer;
        houseGroup14         : Integer;
        houseGroup15         : Integer;
        totalAmount          : Integer;
        totalPurchaseAmount  : Decimal(15, 2);
        sizeKey              : String;
        differingSizeKey     : String;
        incoTerm             : Association to one logistic.IncoTerms  @title: 'Incoterm'    @assert.integrity;
        supplyType           : Association to one ZSTTA_SUP_TYPE      @title: 'Supply Type'  @assert.integrity;
        productionPlant      : Association to one PRODUCTION_PLANT    @title: 'Produktionsstätte';
        transportChain       : Association to one WRF_PSCD_TCHAINH    @title: 'Transportkette';
        purchaseOrderText    : String                                 @title: 'Bestelltext';
        countryOfProduction  : String                                 @title: 'Ursprungsland';
        actionNumber         : Association to one WAKH                @title: 'Aktionsnummer';
        differingHouseGroups : Composition of many {
                                   key houseGroup : Association to one logistic.HouseGroups;
                               };
        isManuallyEdited     : Boolean default false;
        isValidSizeCurve     : Boolean default false;
}

entity UploadArticles : managed {
    key ID                              : UUID;
        image                           : String         @title: 'Bild';
        imageUrl                        : String         @title: 'Bild URL';
        mimeType                        : String         @title: 'Dateiformat';
        supplierProductNumber           : String         @title: 'Lieferantenartikelnummer';
        supplierProductName             : String         @title: 'Lieferantenartikelname';
        supplierColor                   : String         @title: 'Lieferantenfarbe';
        evaluationColor                 : String         @title: 'Auswertefarbe';
        sizeSystem                      : String         @title: 'Größenlauf';
        productGroup                    : String         @title: 'Produktgruppe';
        receiptText                     : String         @title: 'Bontext';
        ownershipStatus                 : String         @title: 'Konsi-Steuerung';
        currency                        : String         @title: 'Währung';
        purchasePrice                   : Decimal(15, 2) @title: 'Einkaufspreis €/$ B';
        purchasePriceNet                : Decimal(15, 2) @title: 'Einkaufspreis Netto €';
        productDiscount1                : Decimal(15, 2) @title: 'Artikelrabatt 1';
        uvpPrice                        : Decimal(15, 2) @title: 'UVP';
        retailPrice                     : Decimal(15, 2) @title: 'Verkaufspreis';
        transportChain                  : String         @title: 'Transportkette';
        productionPlant                 : String         @title: 'Produktionsstätte';
        deliveryDateVZ                  : Date           @title: 'Liefertermin VZ';
        availableFrom                   : Date           @title: 'Lieferbar ab';
        availableUntil                  : Date           @title: 'Lieferbar bis';
        endOfLifeCycle                  : Date           @title: 'Ende Lebenszyklus';
        houseGroup                      : String         @title: 'Hausgruppe';
        supplyType                      : String         @title: 'Supplytype';
        seasonType                      : String         @title: 'Saisontyp';
        seasonYear                      : String         @title: 'Saisonjahr';
        presentationType                : String         @title: 'Präsentationsart';
        GTIN                            : String         @title: 'Beispiel GTIN';
        isOnline                        : Boolean        @title: 'Online';
        material1                       : String         @title: 'Material 1 Code';
        portion1                        : Integer        @title: 'Material 1 %';
        material2                       : String         @title: 'Material 2 Code';
        portion2                        : Integer        @title: 'Material 2 %';
        material3                       : String         @title: 'Material 3 Code';
        portion3                        : Integer        @title: 'Material 3 %';
        material4                       : String         @title: 'Material 4 Code';
        portion4                        : Integer        @title: 'Material 4 %';
        material5                       : String         @title: 'Material 5 Code';
        portion5                        : Integer        @title: 'Material 5 %';
        sustainabilitySealOfApproval    : String         @title: 'Nachhaltigkeit Gütesiegel';
        sustainabilityCertifier         : String         @title: 'NH Zertifizierer';
        sustainabilityCertificateNumber : String         @title: 'Zertifikatsnummer';
        sustainabilityMaterial          : String         @title: 'NH Material';
        sustainabilityPortion           : Integer        @title: 'Anteil NH in %';
        washing                         : String         @title: 'Waschen';
        bleaching                       : String         @title: 'Bleichen';
        drying                          : String         @title: 'Trocknen';
        ironing                         : String         @title: 'Bügeln';
        cleaning                        : String         @title: 'Reinigung';
        washingInstructions             : String         @title: 'Waschanleitung';
        comment                         : String         @title: 'Bemerkung';
        comment2                        : String         @title: 'Bemerkung 2 (Intern)';
        additionalProperties            : Composition of one Products;
        isPromotion                     : Boolean        @title: 'Werbeware';
        productTextVariant              : String         @title: 'Artikel-Kurztext Variante';
        productText                     : String         @title: 'Artikel-Kurztext';
        countryOfProduction             : String         @title: 'Ursprungsland';
        shippingPort                    : String         @title: 'Versandhafen';
        storageLocation                 : String         @title: 'Lagerort';
        size                            : String         @title: 'Größe';
        rowIndex                        : Integer        @title: 'Zeilenindex'  @UI.Hidden;
        alreadyExists                   : Boolean;
        existsIn                        : String;
}

entity UploadProducts : managed {
    key ID                              : UUID;
        image                           : String         @title: 'Bild';
        imageUrl                        : String         @title: 'Bild URL';
        mimeType                        : String         @title: 'Dateiformat';
        supplierProductNumber           : String         @title: 'Lieferantenartikelnummer';
        supplierProductName             : String         @title: 'Lieferantenartikelname';
        supplierColor                   : String         @title: 'Lieferantenfarbe';
        evaluationColor                 : String         @title: 'Auswertefarbe';
        sizeSystem                      : String         @title: 'Größenlauf';
        sizeRun                         : String         @title: 'Größenlauf';
        productGroup                    : String         @title: 'Produktgruppe';
        receiptText                     : String         @title: 'Bontext';
        ownershipStatus                 : String         @title: 'Konsi-Steuerung';
        currency                        : String         @title: 'Währung';
        purchasePrice                   : Decimal(15, 2) @title: 'Einkaufspreis €/$ B';
        purchasePriceNet                : Decimal(15, 2) @title: 'Einkaufspreis Netto €';
        productDiscount1                : Decimal(15, 2) @title: 'Artikelrabatt 1';
        uvpPrice                        : Decimal(15, 2) @title: 'UVP';
        retailPrice                     : Decimal(15, 2) @title: 'Verkaufspreis';
        transportChain                  : String         @title: 'Transportkette';
        productionPlant                 : String         @title: 'Produktionsstätte';
        deliveryDateVZ                  : Date           @title: 'Liefertermin VZ';
        availableFrom                   : Date           @title: 'Lieferbar ab';
        availableUntil                  : Date           @title: 'Lieferbar bis';
        endOfLifeCycle                  : Date           @title: 'Ende Lebenszyklus';
        houseGroup                      : String         @title: 'Hausgruppe';
        supplyType                      : String         @title: 'Supplytype';
        seasonType                      : String         @title: 'Saisontyp';
        seasonYear                      : String         @title: 'Saisonjahr';
        presentationType                : String         @title: 'Präsentationsart';
        GTIN                            : String         @title: 'Beispiel GTIN';
        isOnline                        : Boolean        @title: 'Online';
        material1                       : String         @title: 'Material 1 Code';
        portion1                        : Integer        @title: 'Material 1 %';
        material2                       : String         @title: 'Material 2 Code';
        portion2                        : Integer        @title: 'Material 2 %';
        material3                       : String         @title: 'Material 3 Code';
        portion3                        : Integer        @title: 'Material 3 %';
        material4                       : String         @title: 'Material 4 Code';
        portion4                        : Integer        @title: 'Material 4 %';
        material5                       : String         @title: 'Material 5 Code';
        portion5                        : Integer        @title: 'Material 5 %';
        sustainabilitySealOfApproval    : String         @title: 'Nachhaltigkeit Gütesiegel';
        sustainabilityCertifier         : String         @title: 'NH Zertifizierer';
        sustainabilityCertificateNumber : String         @title: 'Zertifikatsnummer';
        sustainabilityMaterial          : String         @title: 'NH Material';
        sustainabilityPortion           : Integer        @title: 'Anteil NH in %';
        washing                         : String         @title: 'Waschen';
        bleaching                       : String         @title: 'Bleichen';
        drying                          : String         @title: 'Trocknen';
        ironing                         : String         @title: 'Bügeln';
        cleaning                        : String         @title: 'Reinigung';
        washingInstructions             : String         @title: 'Waschanleitung';
        comment                         : String         @title: 'Bemerkung';
        comment2                        : String         @title: 'Bemerkung 2 (Intern)';
        additionalProperties            : Composition of one Products;
        isPromotion                     : Boolean        @title: 'Werbeware';
        productTextVariant              : String         @title: 'Artikel-Kurztext Variante';
        productText                     : String         @title: 'Artikel-Kurztext';
        countryOfProduction             : String         @title: 'Ursprungsland';
        shippingPort                    : String         @title: 'Versandhafen';
        storageLocation                 : String         @title: 'Lagerort';
        size                            : String         @title: 'Größe';
        rowIndex                        : Integer        @title: 'Zeilenindex'  @UI.Hidden;
        alreadyExists                   : Boolean;
        existsIn                        : String;
}

entity UploadVariants : managed {
    key ID                              : UUID;
        image                           : String         @title: 'Bild';
        imageUrl                        : String         @title: 'Bild URL';
        mimeType                        : String         @title: 'Dateiformat';
        supplierProductNumber           : String         @title: 'Lieferantenartikelnummer';
        supplierProductName             : String         @title: 'Lieferantenartikelname';
        supplierColor                   : String         @title: 'Lieferantenfarbe';
        evaluationColor                 : String         @title: 'Auswertefarbe';
        sizeSystem                      : String         @title: 'Größenlauf';
        productGroup                    : String         @title: 'Produktgruppe';
        receiptText                     : String         @title: 'Bontext';
        ownershipStatus                 : String         @title: 'Konsi-Steuerung';
        currency                        : String         @title: 'Währung';
        purchasePrice                   : Decimal(15, 2) @title: 'Einkaufspreis €/$ B';
        purchasePriceNet                : Decimal(15, 2) @title: 'Einkaufspreis Netto €';
        productDiscount1                : Decimal(15, 2) @title: 'Artikelrabatt 1';
        uvpPrice                        : Decimal(15, 2) @title: 'UVP';
        retailPrice                     : Decimal(15, 2) @title: 'Verkaufspreis';
        transportChain                  : String         @title: 'Transportkette';
        productionPlant                 : String         @title: 'Produktionsstätte';
        deliveryDateVZ                  : Date           @title: 'Liefertermin VZ';
        availableFrom                   : Date           @title: 'Lieferbar ab';
        availableUntil                  : Date           @title: 'Lieferbar bis';
        endOfLifeCycle                  : Date           @title: 'Ende Lebenszyklus';
        houseGroup                      : String         @title: 'Hausgruppe';
        supplyType                      : String         @title: 'Supplytype';
        seasonType                      : String         @title: 'Saisontyp';
        seasonYear                      : String         @title: 'Saisonjahr';
        presentationType                : String         @title: 'Präsentationsart';
        GTIN                            : String         @title: 'Beispiel GTIN';
        isOnline                        : Boolean        @title: 'Online';
        material1                       : String         @title: 'Material 1 Code';
        portion1                        : Integer        @title: 'Material 1 %';
        material2                       : String         @title: 'Material 2 Code';
        portion2                        : Integer        @title: 'Material 2 %';
        material3                       : String         @title: 'Material 3 Code';
        portion3                        : Integer        @title: 'Material 3 %';
        material4                       : String         @title: 'Material 4 Code';
        portion4                        : Integer        @title: 'Material 4 %';
        material5                       : String         @title: 'Material 5 Code';
        portion5                        : Integer        @title: 'Material 5 %';
        sustainabilitySealOfApproval    : String         @title: 'Nachhaltigkeit Gütesiegel';
        sustainabilityCertifier         : String         @title: 'NH Zertifizierer';
        sustainabilityCertificateNumber : String         @title: 'Zertifikatsnummer';
        sustainabilityMaterial          : String         @title: 'NH Material';
        sustainabilityPortion           : Integer        @title: 'Anteil NH in %';
        washing                         : String         @title: 'Waschen';
        bleaching                       : String         @title: 'Bleichen';
        drying                          : String         @title: 'Trocknen';
        ironing                         : String         @title: 'Bügeln';
        cleaning                        : String         @title: 'Reinigung';
        washingInstructions             : String         @title: 'Waschanleitung';
        comment                         : String         @title: 'Bemerkung';
        comment2                        : String         @title: 'Bemerkung 2 (Intern)';
        additionalProperties            : Composition of one Products;
        isPromotion                     : Boolean        @title: 'Werbeware';
        productTextVariant              : String         @title: 'Artikel-Kurztext Variante';
        productText                     : String         @title: 'Artikel-Kurztext';
        countryOfProduction             : String         @title: 'Ursprungsland';
        shippingPort                    : String         @title: 'Versandhafen';
        storageLocation                 : String         @title: 'Lagerort';
        size                            : String         @title: 'Größe';
        rowIndex                        : Integer        @title: 'Zeilenindex'  @UI.Hidden;
        alreadyExists                   : Boolean;
        existsIn                        : String;
}

entity UploadWritingAppointments : managed {
    key ID                              : UUID;
        image                           : String         @title: 'Bild';
        imageUrl                        : String         @title: 'Bild URL';
        mimeType                        : String         @title: 'Dateiformat';
        supplierProductNumber           : String         @title: 'Lieferantenartikelnummer';
        supplierProductName             : String         @title: 'Lieferantenartikelname';
        supplierColor                   : String         @title: 'Lieferantenfarbe';
        evaluationColor                 : String         @title: 'Auswertefarbe';
        sizeSystem                      : String         @title: 'Größenlauf';
        productGroup                    : String         @title: 'Produktgruppe';
        receiptText                     : String         @title: 'Bontext';
        ownershipStatus                 : String         @title: 'Konsi-Steuerung';
        currency                        : String         @title: 'Währung';
        purchasePrice                   : Decimal(15, 2) @title: 'Einkaufspreis €/$ B';
        purchasePriceNet                : Decimal(15, 2) @title: 'Einkaufspreis Netto €';
        productDiscount1                : Decimal(15, 2) @title: 'Artikelrabatt 1';
        uvpPrice                        : Decimal(15, 2) @title: 'UVP';
        retailPrice                     : Decimal(15, 2) @title: 'Verkaufspreis';
        transportChain                  : String         @title: 'Transportkette';
        productionPlant                 : String         @title: 'Produktionsstätte';
        deliveryDateVZ                  : Date           @title: 'Liefertermin VZ';
        availableFrom                   : Date           @title: 'Lieferbar ab';
        availableUntil                  : Date           @title: 'Lieferbar bis';
        endOfLifeCycle                  : Date           @title: 'Ende Lebenszyklus';
        houseGroup                      : String         @title: 'Hausgruppe';
        supplyType                      : String         @title: 'Supplytype';
        seasonType                      : String         @title: 'Saisontyp';
        seasonYear                      : String         @title: 'Saisonjahr';
        presentationType                : String         @title: 'Präsentationsart';
        GTIN                            : String         @title: 'Beispiel GTIN';
        isOnline                        : Boolean        @title: 'Online';
        material1                       : String         @title: 'Material 1 Code';
        portion1                        : Integer        @title: 'Material 1 %';
        material2                       : String         @title: 'Material 2 Code';
        portion2                        : Integer        @title: 'Material 2 %';
        material3                       : String         @title: 'Material 3 Code';
        portion3                        : Integer        @title: 'Material 3 %';
        material4                       : String         @title: 'Material 4 Code';
        portion4                        : Integer        @title: 'Material 4 %';
        material5                       : String         @title: 'Material 5 Code';
        portion5                        : Integer        @title: 'Material 5 %';
        sustainabilitySealOfApproval    : String         @title: 'Nachhaltigkeit Gütesiegel';
        sustainabilityCertifier         : String         @title: 'NH Zertifizierer';
        sustainabilityCertificateNumber : String         @title: 'Zertifikatsnummer';
        sustainabilityMaterial          : String         @title: 'NH Material';
        sustainabilityPortion           : Integer        @title: 'Anteil NH in %';
        washing                         : String         @title: 'Waschen';
        bleaching                       : String         @title: 'Bleichen';
        drying                          : String         @title: 'Trocknen';
        ironing                         : String         @title: 'Bügeln';
        cleaning                        : String         @title: 'Reinigung';
        washingInstructions             : String         @title: 'Waschanleitung';
        comment                         : String         @title: 'Bemerkung';
        comment2                        : String         @title: 'Bemerkung 2 (Intern)';
        additionalProperties            : Composition of one Products;
        isPromotion                     : Boolean        @title: 'Werbeware';
        productTextVariant              : String         @title: 'Artikel-Kurztext Variante';
        productText                     : String         @title: 'Artikel-Kurztext';
        countryOfProduction             : String         @title: 'Ursprungsland';
        shippingPort                    : String         @title: 'Versandhafen';
        storageLocation                 : String         @title: 'Lagerort';
        size                            : String         @title: 'Größe';
        rowIndex                        : Integer        @title: 'Zeilenindex'  @UI.Hidden;
        alreadyExists                   : Boolean;
        existsIn                        : String;
}

entity PurchaseGroups {
    key ID   : String;
        name : String;
};

entity BaseUnitOfMeasures {
    key ID   : String;
        name : String;
};

entity StorageUnitOfMeasures {
    key ID   : String;
        name : String;
};
