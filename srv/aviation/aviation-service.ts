import cds, { Request } from '@sap/cds'
import { enrichDataUsingAI } from '../lib/ai-functions';
import { defaultPrompt } from '../lib/default-prompt';

export class ManageAviation extends cds.ApplicationService {

  async init(): Promise<void> {

    this.on("processGenericInput", async (req: Request) => {
      const entityName = `AviationService.${req.data.entityName}`;
      const targetEntity = cds.entities[entityName];
      const chatHistory = req.data.chatHistory ? JSON.parse(req.data.chatHistory) : [];

      if (!targetEntity) {
        req.reject(404, `Target entity context '${entityName}' not found in metadata.`);
      }

      const excludeFields = ['ID', 'createdAt', 'createdBy', 'modifiedAt', 'modifiedBy'];
      const validFields = (Object.entries(targetEntity.elements)
        .filter(([key, value]) => !excludeFields.includes(key))
        .map(([key, value]) => { 
          return { "fieldName": key, "dataType": value.type }
        })
      );

      const systemPrompt = defaultPrompt(
        '2', { entityName: req.data.entityName, validFields: JSON.stringify(validFields) }
      );
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'newUserPrompt', content: req.data.userPrompt }
      ]
      const finalPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      const result = await enrichDataUsingAI(finalPrompt);
      return JSON.stringify(result);
    })

    return super.init();
  }
}

module.exports = ManageAviation