using {managed} from '@sap/cds/common';
using {sap.common.CodeList} from '@sap/cds/common';
using {com.valantic.preorder.common.helper.classification} from '../common/helper/classification';
using {com.valantic.preorder.common.helper.logistic} from '../common/helper/logistic';
using {com.valantic.preorder.common.helper.topic} from '../common/helper/topic';
using {com.valantic.preorder.common.product} from '../common/product';
using {com.valantic.preorder.common} from '../common/supplier';
using {
    LFA1,
    PRICAT_K001,
    ZSTTA_ZIELGR_T,
    WRF_BRANDS,
    T023T,
    MATHIER_HIERNODE5_KT,
    MATHIER_HIERNODE7_SBS,
    MATHIER_HIERNODE6_TBS,
    T6WFGT,
    MARA,
    ZSTTA_SUP_TYPE,
    PRODUCTION_PLANT

} from '../synced/sap-ecc-schema';

namespace com.valantic.preorder.consumertopicbrand;

entity SupplierConsumerTopicBrands : managed {
    key consumerTopic             : Association to one MATHIER_HIERNODE5_KT                    @title: 'KT';
    key brand                     : Association to one WRF_BRANDS                              @title: 'Marke';
    key supplier                  : Association to one LFA1                                    @title: 'BBN';
        pricatCatalog             : Association to one PRICAT_K001                             @title: 'Pricat Katalog';
        vat                       : Association to one classification.VATs default '1'      @mandatory                    @title: 'MwSt';
        priceLevel                : Association to one classification.PriceLevels default '00' @title: 'Ebene Preisartikel';
        supplierContact           : String                                                     @title: 'Lieferanten Ansprechpartner';
        topicComponent            : Association to one MATHIER_HIERNODE6_TBS                   @title: 'TBS'                 @mandatory;
        gridBox                   : Association to one classification.NineGridBoxes            @title: '9-Grid-Box'          @mandatory;
        targetGroup               : Association to one ZSTTA_ZIELGR_T                          @title: 'Zielgruppe'          @mandatory;
        goodsDistribution         : Association to one logistic.GoodsDistributions             @title: 'Warenverteilung';
        ownershipStatus           : Association to one logistic.OwnershipStatus                @title: 'Konsi-Steuerung';
        shippingInstruction       : Association to one logistic.ShippingInstructions           @title: 'Versandvorschrift'   @mandatory;
        loadingGroup              : Association to one logistic.LoadingGroups                  @title: 'Ladegruppe'          @mandatory;
        merchandiseSecurityMethod : Association to one MARA                                    @title: 'Warensicherung';
        priceLabelMethod          : Association to one MARA                                    @title: 'Preisetiketten';
        hangerMethod              : Association to one MARA                                    @title: 'Bügel';
        productGroups             : Association to many product.ProductGroups
                                        on productGroups.supplier = $self;
        isArchived                : Boolean default false                                      @title: 'Archiviert'          @mandatory;
        orderOption               : Association to one OrderOptions default 'None'             @title: 'Bestellmöglichkeit'  @mandatory;
        productType               : Association to one classification.ProductTypes             @mandatory                    @title: 'Artikeltyp';
        supplyType                : Association to one ZSTTA_SUP_TYPE                          @mandatory                    @title: 'SupplyType';

        productionPlant           : Association to one PRODUCTION_PLANT                          @title: 'Produktionsstätte';
        comment                   : String                                                     @title: 'Kommentar';
        to_Programs               : Composition of many {
                                        key ID      : UUID;
                                            program : Association to T6WFGT  @mandatory  @title: 'Programm';
                                    }
        to_WG_SBS                 : Composition of many {
                                        key ID               : UUID;
                                            productGroup     : Association to T023T                 @mandatory  @title: 'WGR';
                                            assortmentModule : Association to MATHIER_HIERNODE7_SBS @mandatory;
                                    }
}

annotate SupplierConsumerTopicBrands.to_Programs with
@assert.unique.program: [
    program,
    up_,
];

annotate SupplierConsumerTopicBrands.to_WG_SBS with
@assert.unique.productGroupAssortmentModule: [
    productGroup,
    assortmentModule,
    up_,
];

entity OrderOptions {
    key ID          : String;
        name        : String;
        description : String;
}
