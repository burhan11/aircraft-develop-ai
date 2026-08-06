import cds, { Request } from '@sap/cds'
import { defaultPrompt } from '../systemPrompts/default-prompt';
import { enrichDataUsingAI } from '../lib/ai-functions';

class AircraftCreationService extends cds.ApplicationService {
  async init(): Promise<void> {

    this.on("enrichAeroplaneData", async (req: Request) => {
      const histroy = req.data.conversationHistory ? JSON.parse(req.data.conversationHistory) : [];
      const systemPrompt = defaultPrompt();
      const messages = [
        { role: 'system', content: systemPrompt },
        ...histroy,
        { role: 'user', content: req.data.userPrompt }
      ]
      const finalPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      const result = await enrichDataUsingAI(finalPrompt);
      return result;
    });

    return super.init();
  }
}

module.exports = AircraftCreationService;