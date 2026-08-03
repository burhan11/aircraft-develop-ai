import cds, { Request } from '@sap/cds'
import { defaultPrompt } from '../systemPrompts/default-prompt';
import { enrichData } from '../lib/ai-functions';

class AircraftCreationService extends cds.ApplicationService {
  async init(): Promise<void> {

    this.on("enrichAeroplaneData", "Aeroplanes", async ({
      params: [ID],
      data: { userPrompt }
    }) => {
      // const userPrompt = req.data.userPrompt;
      const systemPrompt = defaultPrompt();
      const finalPrompt = `${systemPrompt}\nUser Prompt: ${userPrompt}`;
      const result = await enrichData(finalPrompt);
      return result;
    });

    return super.init();
  }
}

module.exports = AircraftCreationService;