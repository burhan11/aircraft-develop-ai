export /** Represents a single article uploaded from the Excel file. */
    interface IUploadedArticle {
      // Core Identification
      supplierProductNumber?: string;
      supplierProductName?: string;
      supplierColor?: string;
      evaluationColor?: string;
      sizeSystem?: string;
      GTIN?: string;

      // Pricing
      currency?: string;
      purchasePrice?: number;
      purchasePriceNet?: number;
      uvpPrice?: number;
      retailPrice?: number;
      productDiscount1?: number;

      // Lifecycle
      availableFrom?: string;
      availableUntil?: string;
      endOfLifeCycle?: string;
      deliveryDateVZ?: string;

      houseGroup?: string;

      // Attributes
      // presentationtType?: string;
      // isPromotion?: string;
      isOnline?: boolean;

      // Materials
      material1?: string;
      portion1?: string;
      material2?: string;
      portion2?: string;
      material3?: string;
      portion3?: string;
      material4?: string;
      portion4?: string;
      material5?: string;
      portion5?: string;

      countryOfProduction?: string; //not available in product master
      shippingPort?: string;
      productionPlant?: string;
      uvpType?: string;
      sustainabilitySealOfApproval?: string;
      sustainabilityCertifier?: string;
      sustainabilityCertificateNumber?: string;
      sustainabilityMaterial?: string;
      sustainabilityPortion?: string;
      washing?: string;
      bleaching?: string;
      ironing?: string;
      cleaning?: string;
      drying?: string;
      washingInstructions?: string;
      productGroup?: string;
      receiptText?: string;
      ownershipStatus?: string;
      transportChain?: string;
      supplyType?: string;
      seasonType?: string;
      seasonYear?: string;
      presentationType?: string;

      comment?: string;
      comment2?: string;

      // UI & Processing Properties
      image?: string; // base64 representation
      imageUrl?: string; // hyperlink from excel
      statusText?: string;
      alreadyExists?: boolean;
      existsIn?: string;
      mimeType?: string;
      additionalProperties?: Record<string, unknown>;
      rowIndex: number;
    }