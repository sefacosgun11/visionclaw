import { MockAnalysisProvider } from './mockProvider';
import { OpenAIAnalysisProvider } from './openaiProvider';

let provider: any = null;

export function getAnalysisProvider() {
  if (!provider) {
    const type = process.env.ANALYSIS_PROVIDER || 'mock';
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (type === 'openai' && apiKey) {
      console.log('✅ Provider initialized: OpenAI');
      provider = new OpenAIAnalysisProvider(apiKey);
    } else {
      if (type === 'openai' && !apiKey) {
        console.warn('⚠️  OpenAI selected but no API key - falling back to mock');
      }
      console.log('✅ Provider initialized: Mock');
      provider = new MockAnalysisProvider();
    }
  }
  return provider;
}
