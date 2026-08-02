using {com.valantic.preorder.common.helper.classification} from './classification';
using {com.valantic.preorder.common.product} from '../product';
using {com.valantic.preorder.common.helper.logistic} from './classification';
using {com.valantic.preorder.common.helper.method} from './method';
using {com.valantic.preorder.product as productschema} from '../../product/schema';
using {
    LFA1,
    MATHIER_HIERNODE5_KT,
    MATHIER_HIERNODE7_SBS,
    MATHIER_HIERNODE6_TBS,
    WRF_BRANDS,
    ZSTTA_GROE_SYS,
    ZSTTA_MUSTER_T,
    ZSTTA_SONDERARTT,
    ZBMTA0081_SERIE,
    ZSTTA_ZIELGR_T,
    T023T,
    T6WFGT,
    PRICAT_K001,
    MARA,
    ZSTTA_SUP_TYPE,
    ZSTTA_NH_GS_T,
    PRODUCTION_PLANT,
    WRF_PSCD_TCHAINH

} from '../../synced/sap-ecc-schema';

namespace com.valantic.preorder.common.helper.reuse;

aspect ProductFields {
    // BASIC
    supplier                        : Association to one LFA1                              @title: 'BBN'                                           @assert.integrity;
    consumerTopic                   : Association to one MATHIER_HIERNODE5_KT              @title: 'KT'                                            @assert.integrity;
    brand                           : Association to one WRF_BRANDS                        @title: 'Marke'                                         @assert.integrity;
    topicComponent                  : Association to one MATHIER_HIERNODE6_TBS             @title: 'TBS'                                           @assert.integrity;
    assortmentModule                : Association to one MATHIER_HIERNODE7_SBS             @title: 'SBS'                                           @assert.integrity;
    productGroup                    : Association to one T023T                             @title: 'WGR'                                           @assert.integrity;
    targetGroup                     : Association to one ZSTTA_ZIELGR_T                    @title: 'Zielgruppe'                                    @assert.integrity;
    module                          : Association to one productschema.Modules             @title: 'Modul'                                         @assert.integrity; //WRF_CHARVAL

    // IDENTIFICATION
    supplierProductNumber           : String                                               @title: 'Lieferanten Artikelnummer';
    productText                     : String                                               @title: 'Artikel-Kurztext';
    supplierProductName             : String                                               @title: 'Lieferanten Artikelname';
    receiptText                     : String                                               @title: 'Bontext';
    sizeSystem                      : Association to one ZSTTA_GROE_SYS                    @title: 'Größensystem'                                  @assert.integrity;
    sizeRun                         : String                                               @title: 'Größenlauf';
    supplyType                      : Association to one ZSTTA_SUP_TYPE                    @title: 'SupplyType'                                    @assert.integrity;
    seasonType                      : Association to one classification.SeasonTypes        @title: 'Saison'                                        @assert.integrity;
    seasonYear                      : String                                               @title: 'Saisonjahr';
    presentationType                : Association to one productschema.PresentationTypes   @title: 'Präsentationsart'                              @assert.integrity; //WRF_CHARVAL
    availableFrom                   : Date                                                 @title: 'Lieferbar ab';
    availableUntil                  : Date                                                 @title: 'Lieferbar bis';
    endOfLifeCycle                  : Date                                                 @title: 'Ende Lebenszyklus';

    // NEW PURCHASE
    currency                        : Association to one logistic.Currencies               @title: 'Währung'                                       @assert.integrity;
    vat                             : Association to one classification.VATs               @title: 'MwSt'                                          @assert.integrity;
    purchasePrice                   : Decimal(15, 2)                                       @title: 'Einkaufspreis €/$ B';
    purchaseFactor                  : Decimal(15, 2)                                       @title: 'EK  US$ / Faktor';
    purchasePriceUSD                : Decimal(15, 2)                                       @title: 'Einkaufspreis US$';
    purchasePriceEURNetto           : Decimal(15, 2)                                       @title: 'Einkaufspreis final Netto €';
    productDiscount1                : Decimal(15, 2)                                       @title: 'Artikelrabatt 1';
    productDiscount2                : Decimal(15, 2)                                       @title: 'Artikelrabatt 2';
    productDiscount3                : Decimal(15, 2)                                       @title: 'Artikelrabatt 3';

    // NEW SALES
    retailPrice                     : Decimal(15, 2)                                       @title: 'Verkaufspreis';
    currentPrice                    : Decimal(15, 2)                                       @title: 'Streichpreis/Aktueller Preis';
    uvpType                         : Association to one classification.UVPTypes           @title: 'UVP Typ'                                       @assert.integrity;
    uvpPrice                        : Decimal(15, 2)                                       @title: 'UVP Preis';

    // CLASSIFICATION
    sapNumber                       : String                                               @title: 'SAP Nummer';
    pricatCatalog                   : Association to one PRICAT_K001                       @title: 'Pricat Katalog'                                @assert.integrity;
    productType                     : Association to one classification.ProductTypes       @title: 'Artikeltyp'                                    @assert.integrity;
    ownershipStatus                 : Association to one logistic.OwnershipStatus          @title: 'Konsi-Steuerung'                               @assert.integrity;
    gridBox                         : Association to one classification.NineGridBoxes      @title: '9-Grid-Box'                                    @assert.integrity;
    omnichannel                     : Association to one productschema.Omnichannels        @title: 'Omnichannel'                                   @assert.integrity;
    priceLevel                      : Association to one classification.PriceLevels        @title: 'Ebene Preisartikel'                            @assert.integrity;

    // NEW TO BE CHECKED
    houseGroup                      : Association to one logistic.HouseGroups              @title: 'Hausgruppe';
    onlineSalesFrom                 : Date                                                 @title: 'Verkauf ab für Online';
    series                          : Association to one ZBMTA0081_SERIE                   @title: 'Serie'                                         @assert.integrity;
    license                         : Association to one productschema.Licenses            @title: 'Lizenz'                                        @assert.integrity;
    program                         : Association to one T6WFGT                            @title: 'Programm'                                      @assert.integrity;
    occasion                        : Association to one productschema.Occasions           @title: 'Anlass'                                        @assert.integrity; //WRF_CHARVAL
    property                        : Association to one productschema.Properties          @title: 'Eigenschaft'                                   @assert.integrity; //WRF_CHARVAL
    quality                         : Association to one productschema.Qualities           @title: 'Qualität'                                      @assert.integrity; //WRF_CHARVAL
    pattern                         : Association to one ZSTTA_MUSTER_T                    @title: 'Muster';
    specialProduct                  : Association to one ZSTTA_SONDERARTT                  @title: 'Sonderartikel';
    surfaceWashing                  : Association to one productschema.SurfaceWashings     @title: 'Oberflächenwaschung'                           @assert.integrity; //WRF_CHARVAL
    mainForm                        : Association to one productschema.MainForms           @title: 'Formhaupt'                                     @assert.integrity; //WRF_CHARVAL
    stockingThickness               : Association to one productschema.StockingThickness   @title: 'Strumpfstärke'                                 @assert.integrity; //WRF_CHARVAL
    basicDataText                   : String                                               @title: 'Grunddatentext';
    purchaseOrderText               : String                                               @title: 'Einkaufsbestelltext';
    merchandiseSecurityMethod       : Association to one MARA                              @title: 'Warensicherung'                                @assert.integrity;
    priceLabelMethod                : Association to one MARA                              @title: 'Preisetiketten'                                @assert.integrity;
    hangerMethod                    : Association to one MARA                              @title: 'Bügel'                                         @assert.integrity;
    loadingGroup                    : Association to one logistic.LoadingGroups            @title: 'Ladegruppe'                                    @assert.integrity;
    sustainabilitySealOfApproval    : Association to one ZSTTA_NH_GS_T                     @title: 'Nachhaltigkeit Gütesiegel'                     @assert.integrity;
    sustainabilityCertifier         : String                                               @title: 'NH Zertifizierer';
    sustainabilityCertificateNumber : String                                               @title: 'Zertifikatsnummer';
    sustainabilityMaterial          : String                                               @title: 'NH Material';
    sustainabilityPortion           : Integer                                              @title: 'Anteil NH in %';
    washing                         : Association to one method.WashingMethods             @title: 'Waschen'                                       @assert.integrity;
    bleaching                       : Association to one method.BleachingMethods           @title: 'Bleichen'                                      @assert.integrity;
    ironing                         : Association to one method.IroningMethods             @title: 'Bügeln'                                        @assert.integrity;
    cleaning                        : Association to one method.CleaningMethods            @title: 'Reinigung'                                     @assert.integrity;
    drying                          : Association to one method.DryingMethods              @title: 'Trocknen'                                      @assert.integrity;
    differentUnitOfMeasureAvailable : Boolean                                              @title: 'Abweichende Mengeneinheit';
    differentUnitOfMeasure1         : String                                               @title: 'Alternative-ME1';
    differentUnitOfMeasureOut1      : String                                               @title: 'Alternative-ME1-Lagerausgabemenge';
    differentUnitOfMeasure2         : String                                               @title: 'Alternative-ME2';
    differentUnitOfMeasureOut2      : String                                               @title: 'Alternative-ME2-Lagerausgabemenge';
    differentUnitOfMeasure3         : String                                               @title: 'Alternative-ME3';
    differentUnitOfMeasureOut3      : String                                               @title: 'Alternative-ME3-Lagerausgabemenge';
    differentUnitOfMeasure4         : String                                               @title: 'Alternative-ME4';
    differentUnitOfMeasureOut4      : String                                               @title: 'Alternative-ME4-Lagerausgabemenge';
    onlineOrderStep                 : String                                               @title: 'Online Bstellschritt';
    minimumOrderQuantity            : Integer                                              @title: 'Mindestbestellmenge Online';
    maximumOrderQuantity            : Integer                                              @title: 'Maximale Bestellmenge Online';
    baseUnitOfMeasure               : Association to one productschema.BaseUnitOfMeasures  @title: 'Basismengeneinheit'                            @assert.integrity;
    storageUnit                     : Association to one productschema.StorageUnitOfMeasures  @title: 'Lagerausgabemengeneinheit'                     @assert.integrity;
    storageUnitConversionRatio      : Decimal(15, 5)                                       @title: 'Umrechnungsfaktor Lagerausgabemengeneinheit';

    comment                         : String                                               @title: 'Bemerkung';
    comment2                        : String                                               @title: 'Bemerkung 2 (Intern)    ';
    washingInstructions             : String                                               @title: 'Waschanleitung';
    countryOfProduction             : String                                               @title: 'Ursprungsland';
    storageLocation                 : Association to one logistic.StorageLocations         @title: 'Lagerort'                                      @assert.integrity;
    creationStatus                  : Association to one product.CreationStatus            @title: 'Erstellungsstatus'                             @assert.integrity;
    //purchaseGroup                   : Association to one productschema.PurchaseGroups      @title: 'Einkäufergruppe'            @assert.integrity;
    isImported                      : Boolean default false;
    isUploaded                      : Boolean default false                                @UI.Hidden;
    isArchived                      : Boolean default false                                @title: 'Archiviert';

    // OTHER
    shippingInstruction             : Association to one logistic.ShippingInstructions     @title: 'Versandvorschrift'                             @assert.integrity;
    material1                       : Association to product.Materials                     @title: 'Material 1 Code'                               @assert.integrity;
    portion1                        : Integer                                              @title: 'Material 1 %';
    material2                       : Association to product.Materials                     @title: 'Material 2 Code'                               @assert.integrity;
    portion2                        : Integer                                              @title: 'Material 2 %';
    material3                       : Association to product.Materials                     @title: 'Material 3 Code'                               @assert.integrity;
    portion3                        : Integer                                              @title: 'Material 3 %';
    material4                       : Association to product.Materials                     @title: 'Material 4 Code'                               @assert.integrity;
    portion4                        : Integer                                              @title: 'Material 4 %';
    material5                       : Association to product.Materials                     @title: 'Material 5 Code'                               @assert.integrity;
    portion5                        : Integer                                              @title: 'Material 5 %';
    differingIncoTerm               : Association to one logistic.IncoTerms                @title: 'Abweichender Incoterm'                         @assert.integrity;
    transportChain                  : Association to one WRF_PSCD_TCHAINH                  @title: 'Transportkette'                                @assert.integrity;
    productionPlant                 : Association to one PRODUCTION_PLANT                  @title: 'Produktionsstätte'                             @assert.integrity;
    shippingPort                    : Association to one logistic.ShippingPorts            @title: 'Verschiffungshafen'                            @assert.integrity;

    // LABELS
    mainLabel                       : Association to one MARA                              @title: 'Main Label'                                    @assert.integrity;
    subLabel                        : Association to one MARA                              @title: 'Sub Label'                                     @assert.integrity;
    sizeLabel                       : Association to one MARA                              @title: 'Size Label'                                    @assert.integrity;
    sizeCode                        : Association to one MARA                              @title: 'Size Code'                                     @assert.integrity;
    hangTag                         : Association to one MARA                              @title: 'Hang Tag'                                      @assert.integrity;
    stringWithSeal                  : Association to one MARA                              @title: 'String with Seal'                              @assert.integrity;
    priceSticker                    : Association to one MARA                              @title: 'Price Sticker'                                 @assert.integrity;
    careLabel                       : Association to one MARA                              @title: 'Care Label'                                    @assert.integrity;
    addHangTag                      : Association to one MARA                              @title: 'Add. Hang Tag'                                 @assert.integrity;
    specialOffer                    : Boolean                                              @title: 'Sonderposten';

    // SAP Sync Status
    sapHttpStatus                   : Integer;
    sapHttpStatusText               : String;
    sapStatus                       : String;
    sapStatusText                   : String;
    sapTransactionId                : String;
}

aspect ColorFields {
    imageUrl        : String                                       @title: 'Bild';
    supplierColor   : String                                       @title: 'Lieferanten Farbe';
    evaluationColor : Association to one product.EvaluationColors  @title: 'Auswertefarbe'  @assert.integrity;
}
