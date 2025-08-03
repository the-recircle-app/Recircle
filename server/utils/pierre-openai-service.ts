// OpenAI service following Pierre's exact pattern from x-app-template
import OpenAI from 'openai';
import { ValidationResult } from '../../shared/pierre-vebetterdao-types';

export class PierreOpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.startsWith('sk-proj-abcdefg')) {
      throw new Error('Valid OpenAI API key required for receipt validation');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async validateImage(base64Image: string): Promise<ValidationResult | undefined> {
    try {
      console.log('🔍 [OPENAI] Starting OpenAI Vision API analysis...');
      console.log('🔍 [OPENAI] Image size:', base64Image.length, 'characters');
      
      const startTime = Date.now();
      console.log('🚀 [OPENAI] Making API call to OpenAI...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI API timeout after 30 seconds')), 30000);
      });
      
      const apiCallPromise = this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this receipt image for sustainable transportation purchases. 

Consider these criteria for validity (score 0-1):
- Is this a legitimate receipt/invoice?
- Does it show payment for sustainable transportation (public transit, bike share, electric vehicle rental, ride sharing with electric/hybrid vehicles)?
- Are the details clear and readable?
- Does it appear authentic (not manipulated/fraudulent)?

Sustainable transportation examples:
- Public transit (bus, train, subway, metro)
- Bike sharing services
- Electric vehicle rentals
- Electric scooter rentals
- Ride sharing with electric/hybrid vehicles
- Car sharing services
- Electric taxi services

Return a JSON object with:
{
  "validityFactor": 0.8,
  "reasoning": "Clear receipt for electric bike rental with authentic details",
  "confidence": 0.9
}

Score 0.7+ for clearly valid sustainable transport receipts.
Score 0.3-0.6 for questionable or unclear receipts.
Score 0.0-0.2 for clearly invalid, non-transport, or fraudulent items.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      console.log('⏳ [OPENAI] Waiting for API response...');
      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      console.log('📨 [OPENAI] API response received');

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const elapsed = Date.now() - startTime;
      console.log(`🤖 [OPENAI] Raw Response (${elapsed}ms):`, content);

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ [OPENAI] No JSON found in response:', content);
        throw new Error('Invalid JSON response from OpenAI');
      }

      const result = JSON.parse(jsonMatch[0]) as ValidationResult;
      
      console.log(`✅ [OPENAI] Validation Result: ${result.validityFactor} (${result.reasoning})`);
      console.log(`✅ [OPENAI] Total processing time: ${elapsed}ms`);
      
      return result;
      
    } catch (error) {
      console.error('❌ [OPENAI] Validation error:', error);
      console.error('❌ [OPENAI] Error type:', error.constructor.name);
      console.error('❌ [OPENAI] Error message:', error.message);
      
      // Return undefined to match Pierre's error handling pattern
      return undefined;
    }
  }
}

export const pierreOpenAIService = new PierreOpenAIService();