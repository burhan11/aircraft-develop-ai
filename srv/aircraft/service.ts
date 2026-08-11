import cds, { Request } from '@sap/cds'
import { defaultPrompt } from '../systemPrompts/default-prompt';
import { enrichDataUsingAI } from '../lib/ai-functions';
import referenceData from './data/aircraft-reference.json';

class AircraftCreationService extends cds.ApplicationService {
  async init(): Promise<void> {

    this.on("enrichAeroplaneData", async (req: Request) => {
      const histroy = req.data.conversationHistory ? JSON.parse(req.data.conversationHistory) : [];
      const referenceRecord: any = this.searchIntoReferenceData(req.data.userPrompt);
      const referencText = referenceRecord.length > 0
        ? `here are top 2 reference record from my dataset, use to answer it instead of your traning data${referenceRecord}`
        : 'No reference record found use your traning knowledge';
      const messages = [
        { role: 'system', content: `${defaultPrompt()}\n\n${referencText}` },
        ...histroy,
        { role: 'user', content: req.data.userPrompt }
      ]
      const finalPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      const result = await enrichDataUsingAI(finalPrompt);
      return result;
    });

    this.on("searchAeroplaneByRange", async (req: Request) => {
      const { Aeroplanes } = cds.entities("com.valantic.schema.aircraft")
      const searchRange = req.data.range;
      return cds.run(
        SELECT.from(Aeroplanes)
        .where({ range: { ">=": searchRange } })
      )  
    });

    return super.init();
  }

  // RAG search
  searchIntoReferenceData = (userPrompt: string) => {
    const userPromptLower = userPrompt?.toLowerCase();
    const response = referenceData.map((record) => {
      const refRecord = `${record.model} ${record.manufacturer} ${record.category} ${record.category} ${record.range}`;
      const words = refRecord.toLowerCase().split('/\s+/');
      const score = words.filter((item) => userPromptLower?.includes(item)).length;
      return { record, score }
    });
    return response
      .filter(item => item.score > 0)
      .sort((a: any, b: any) => b - a)
      .slice(0, 2)
      .map((entry) => entry.record);
  }
}

module.exports = AircraftCreationService;