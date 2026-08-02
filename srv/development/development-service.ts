import cds from "@sap/cds";
import { initAWS } from "../lib/common/file-uploader";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
class DevelopmentService extends cds.ApplicationService {
  async init() {
    const { s3, bucket } = await initAWS();
    this.on("deleteImageUrl", async ({ data: { key } }) => {
      if (typeof key != "string") {
        return;
      }
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3.send(deleteObjectCommand);
    });

    this.on("createSAPProduct", async ({ data }) => {
      const { INSERT } = cds.ql
      const preorder = await cds.connect.to("API_PREORDER")
      console.log(data)

      try {
        const result = await preorder.run(INSERT.into("DeepProductSet").entries([data
        ]))
        console.log("RESULT", result, result.to_Products)
      }
      catch (e) {
        console.error(e)
      }
    })

    this.on("createSAPOrder", async ({ data }) => {
      const { INSERT } = cds.ql
      const preorder = await cds.connect.to("API_PREORDER")
      //const { DeepOrderSet } = preorder.entities
      console.log(data)

      try {
        const result = await preorder.run(INSERT.into("DeepOrderSet").entries([data
        ]))
        console.log("RESULT", result)
      }
      catch (e) {
        console.error("ERROR",e)
        //console.log("RESPONSE", (e as any)?.response,(e as any)?.reason?.response?.body?.error?.innererror?.errordetails)
      }
    })
    return super.init();
  }
}
module.exports = DevelopmentService;