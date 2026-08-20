import cds, { Request } from '@sap/cds';
import { enrichDataUsingAI } from '../lib/ai-functions';
import { defaultPrompt } from '../lib/default-prompt';

export class ManageAviation extends cds.ApplicationService {

  async init(): Promise<void> {

    this.on("processGenericInput", async (req: Request) => {
      const rawEntityName = req.data.entityName;
      
      // Attempt entity resolution across service and database namespaces
      const candidateNames = [
        `AviationService.${rawEntityName}`,
        `AircraftService.${rawEntityName}`,
        `com.valantic.schema.aviation.${rawEntityName}`,
        `com.valantic.schema.aircraft.${rawEntityName}`,
        rawEntityName
      ];

      let targetEntity: any = null;
      for (const candidate of candidateNames) {
        if (cds.entities[candidate]) {
          targetEntity = cds.entities[candidate];
          break;
        }
      }

      if (!targetEntity) {
        // Fallback: search cds.entities by matching suffix
        const matchingKey = Object.keys(cds.entities).find(key => key.endsWith(`.${rawEntityName}`));
        if (matchingKey) {
          targetEntity = cds.entities[matchingKey];
        }
      }

      if (!targetEntity) {
        req.reject(404, `Target entity context '${rawEntityName}' not found in CAP metadata.`);
      }

      const excludeFields = ['ID', 'createdAt', 'createdBy', 'modifiedAt', 'modifiedBy'];
      const validFields = Object.entries(targetEntity.elements)
        .filter(([key, element]: [string, any]) => !excludeFields.includes(key) && !element.isAssociation && !element.isComposition)
        .map(([key, element]: [string, any]) => {
          return {
            fieldName: key,
            dataType: element.type || 'cds.String',
            label: element['@title'] || element.label || key,
            isMandatory: !!element['@mandatory']
          };
        });

      const chatHistory = req.data.chatHistory ? JSON.parse(req.data.chatHistory) : [];
      const systemPrompt = defaultPrompt(
        '2', { entityName: rawEntityName, validFields: JSON.stringify(validFields) }
      );

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: req.data.userPrompt }
      ];

      const finalPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      const rawResult = await enrichDataUsingAI(finalPrompt);

      let parsedResult: any;
      if (typeof rawResult === 'string') {
        try {
          parsedResult = JSON.parse(rawResult);
        } catch {
          parsedResult = {
            extracted: {},
            suggestions: {},
            changes: {},
            message: rawResult
          };
        }
      } else {
        parsedResult = rawResult;
      }

      // Ensure fallback structures exist
      parsedResult.extracted = parsedResult.extracted || {};
      parsedResult.suggestions = parsedResult.suggestions || {};
      parsedResult.changes = parsedResult.changes || {};

      return JSON.stringify(parsedResult);
    });

    return super.init();
  }
}

module.exports = ManageAviation;