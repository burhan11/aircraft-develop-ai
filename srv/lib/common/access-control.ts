import cds, { Request } from "@sap/cds";

export const fetchAllowedConsumerTopics = async (req: any) => {
  const accessControlDataService = await cds.connect.to(
    "AccessControlDataService",
  );
  let groupsFromJWT;
  if (cds.env.production) {
    const jwtBase64Encoded =
      req?.headers?.authorization?.split(" ")?.[1] ??
      req?.http?.req?.headers?.authorization?.split(" ")?.[1];
    if(jwtBase64Encoded) {
      const jwtDecodedJson = JSON.parse(
        Buffer.from(jwtBase64Encoded.split(".")[1], "base64").toString(),
      );
      groupsFromJWT =
        jwtDecodedJson?.["xs.system.attributes"]?.["xs.saml.groups"] || [];
    }
    else {
      groupsFromJWT = [];
    }
  } else {
    groupsFromJWT = JSON.parse(process.env.GROUPS || "[]");
  }
  console.debug("Decoded JWT Payload:", groupsFromJWT);

  const { Users, GroupsConsumerTopics } = accessControlDataService.entities;

  try {
    const { SELECT } = cds.ql;
    const allowedTopics = await accessControlDataService.run(
      SELECT.from(GroupsConsumerTopics)
        .where({
            group_ID: { in: groupsFromJWT },
            /*or: {
            consumerTopic_ID: {
              in: SELECT.from(Users)
                .where({ ID: req?.user?.id })
                .columns(
                  "assignedGroups.group.consumerTopics.consumerTopic_ID",
                ), // Path expression
            },
          },*/
        })
        .columns("consumerTopic_ID"),
    );

    return allowedTopics;
  } catch (error) {
    console.error("Error fetching allowed topics for user:", error);
    // Bei einem Fehler keine Daten zurückgeben
    req.error(500, "Error filtering data");
    return [];
  }
};
