import cds from "@sap/cds";
import { 
  Product, 
  Products, 
  ProductSiz, 
  ProductSizes, 
  Article, 
  Articles, 
  MARA,
  PRICAT_K003
 } from "#cds-models/Product";

interface IValidationError {
  code: string,
  args: any[]
}

const allowedStatus = ["InProgress", "ToCheck", "CreationFailed"];

export const checkIfGTINExistsInTool = async (
  GTIN: string
): Promise<{ existing: boolean; existingIn: string | null }> => {

  if (GTIN) {
    const existingSize: ProductSizes = await cds.run(
      SELECT.one.from(ProductSizes).where({ GTIN: GTIN })
    );
    if (existingSize) {
      return { existing: true, existingIn: "PREORDER" };
    }
    const findInMARA = await cds.run(
      SELECT.one.from(MARA).where({ EAN: GTIN }),
    );
    if (findInMARA) {
      return { existing: true, existingIn: "SAP" };
    }
    const findInPRICAT_K003 = await cds.run(
      SELECT.one.from(PRICAT_K003).where({ EAN_UPC_BASE: GTIN }),
    );
    if (findInPRICAT_K003) {
      return { existing: true, existingIn: "PRICAT" };
    }
  }

  return { existing: false, existingIn: null };

};

export const validateAllChild = async (
  ID: string,
  level: string
): Promise<IValidationError | undefined> => {
  switch (level) {
    case "1":
      const article: Article = await getArticleDetails(ID);
      if (article && article.to_Option?.length === 0) {
        return {
          code: "OPTION_MISSING_FOR_ARTICLE",
          args: [article.supplierProductNumber ?? article.ID]
        }
      }

      for (const option of article.to_Option || []) {
        if (option && option.to_Size?.length === 0) {
          return {
            code: "VARIANT_MISSING_FOR_OPTION",
            args: [option.evaluationColor_ID ?? option.ID]
          }
        }
      }
      break;
      
    case "2":
      const option: Product = await getOptionDetails(ID)
      if (option && option.to_Size?.length === 0) {
        return {
          code: "VARIANT_MISSING_FOR_OPTION",
          args: [option.evaluationColor_ID ?? option.ID]
        }
      }
      break;
      
    default:
      break;
  }
  return
};

export const getArticleDetails = async (
  ID: string
): Promise<Article> => {
  const article = await cds.run(
    SELECT.one.from(Articles)
      .where({ 
        ID: ID,
        status_ID: { in: allowedStatus }
      })
      .columns((art: any) => {
        art("*");
        art.to_Option((opt: any) => {
          opt("*");
          opt.to_Size((sizes: any) => {
            sizes("*")
          })
        })
      })
  );
  if (article.to_Option?.length > 0) {
    article.to_Option = article.to_Option
      .filter((item: any) => allowedStatus.includes(item.status_ID))
      .map((opt: any) => ({
        ...opt,
        to_Size: opt.to_Size
          .filter((item: any) => allowedStatus.includes(item.status_ID)) ?? []
      }) 
    )
  }
  return article;
}

export const getOptionDetails = async (
  ID: string
): Promise<Product> => {
  const option = await cds.run(
    SELECT.one.from(Products)
      .where({ 
        ID: ID,
        status_ID: { in: allowedStatus }
      })
      .columns((opt: any) => {
        opt("*");
        opt.to_Size((sizes: any) => {
          sizes("*")
        })
      })
  );
  if (option.to_Size?.length > 0) {
    option.to_Size = option.to_Size
      .filter((item: any) => allowedStatus.includes(item.status_ID));
  }
  return option;
}

export const getProductSizesDetails = async (
  ID: string
): Promise<ProductSiz> => {
  return cds.run(
    SELECT.one.from(ProductSizes)
      .where({
        ID: ID,
        status_ID: { in: allowedStatus }
      })
      .columns("*")
  );
}

export const getSizeDetails = async (
  ID: string,
  level: string
): Promise<ProductSiz[] | undefined> => {
  let result: any;
  switch (level) {
    case "1":
      result = await getArticleDetails(ID);
      return result?.to_Option?.flatMap((opt: any) => 
        opt.to_Size || [] ) || [];
    case "2":
      result = await getOptionDetails(ID);
      return result.to_Size || []
    case "3":
      result = await cds.run(
        SELECT.from(ProductSizes)
          .where({ ID: ID })
          .columns("*")
      );
      return result || [];
  }
}
