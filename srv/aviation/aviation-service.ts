import cds, { Request } from '@sap/cds'
import { enrichDataUsingAI } from '../lib/ai-functions';
import { defaultPrompt } from '../lib/default-prompt';

export class ManageAviation extends cds.ApplicationService {

  async init(): Promise<void> {

    this.on("processGenericInput", async (req: Request) => {
      const entityName = `AviationService.${req.data.entityName}`;
      const targetEntity = cds.entities[entityName];

      if (!targetEntity) {
        req.reject(404, `Target entity context '${entityName}' not found in metadata.`);
      }

      const excludeFields = ['ID', 'createdAt', 'createdBy', 'modifiedAt', 'modifiedBy'];
      const validFields = (Object.keys(targetEntity.elements)
        .filter((element: any) => !excludeFields.includes(element)
      ));

      const systemPrompt = defaultPrompt(
        '2', { entityName: req.data.entityName, validFields: JSON.stringify(validFields) }
      );
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: req.data.userPrompt }
      ]
      const finalPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      const result = await enrichDataUsingAI(finalPrompt);
      return JSON.stringify(result);
    })

    return super.init();
  }
}

module.exports = ManageAviation