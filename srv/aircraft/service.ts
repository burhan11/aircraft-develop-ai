import cds, { Request } from '@sap/cds'
import { defaultPrompt } from '../systemPrompts/default-prompt';
import { enrichData } from '../lib/ai-functions';

class AircraftCreationService extends cds.ApplicationService {
  async init(): Promise<void> {

    this.on("enrichAeroplaneData", "Aeroplanes", async ({
      params: [ID],
      data: { userPrompt, conversationHistory }
    }) => {
      const histroy = conversationHistory ? JSON.parse(conversationHistory) : [];
      const systemPrompt = defaultPrompt();
      const messages = [
        { role: 'system', content: systemPrompt },
        ...histroy,
        { role: 'user', content: userPrompt }
      ]

      const finalPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');

      //`${systemPrompt}\nUser Prompt: ${userPrompt}`;
      const result = await enrichData(finalPrompt);
      return result;
    });

    return super.init();
  }
}

module.exports = AircraftCreationService;