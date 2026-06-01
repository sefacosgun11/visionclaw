import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function checkItemPresence(
  imageUrl: string,
  requiredItems: string[]
): Promise<{
  items_checked: Array<{
    item: string;
    status: 'present' | 'missing' | 'uncertain';
    confidence: number;
    reason: string;
  }>;
  overall_status: 'passed' | 'failed' | 'needs_review';
  summary: string;
}> {
  const prompt = `You are an industrial inspection AI assistant.

TASK: Analyze the uploaded image and check for the presence of required items/components.

REQUIRED ITEMS TO CHECK:
${requiredItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

For each item, determine:
- STATUS: "present", "missing", or "uncertain"
- CONFIDENCE: 0.0 to 1.0 (decimal number)
- REASON: Brief explanation (max 1 sentence)

RESPOND ONLY IN THIS JSON FORMAT (no markdown, no code blocks, pure JSON):
{
  "items_checked": [
    {
      "item": "exact item name from list",
      "status": "present",
      "confidence": 0.95,
      "reason": "clearly visible in center of image"
    }
  ],
  "overall_status": "passed",
  "summary": "all required items present and verified"
}

RULES:
- "present" = clearly visible and identifiable
- "missing" = not visible or absent from image
- "uncertain" = partially visible, obstructed, or unclear
- Overall "passed" = all items present with confidence > 0.7
- Overall "failed" = any item missing
- Overall "needs_review" = any uncertain items or low confidence
- Be strict but fair in your assessment
- CRITICAL: Return ONLY valid JSON, no markdown formatting`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.3
  });

  const content = response.choices[0].message.content || '{}';

  // Better cleanup
  const cleanContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^[\s\n]*/, '') // Remove leading whitespace
    .replace(/[\s\n]*$/, '') // Remove trailing whitespace
    .trim();

  console.log('Raw AI response:', content);
  console.log('Cleaned content:', cleanContent);

  try {
    const result = JSON.parse(cleanContent);
    return result;
  } catch (error) {
    console.error('JSON parse failed. Raw:', content);
    console.error('Cleaned:', cleanContent);
    throw new Error(`AI returned invalid JSON: ${error}`);
  }
}

export async function detectDefects(
  imageUrl: string,
  defectTypes: string[],
  sensitivity: number = 0.7
): Promise<{
  defects: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    confidence: number;
    location: string;
    description: string;
  }>;
  overall_status: 'passed' | 'failed' | 'needs_review';
  summary: string;
}> {
  const prompt = `You are an industrial quality control AI assistant.

TASK: Analyze the uploaded image and detect surface defects or anomalies.

DEFECT TYPES TO CHECK:
${defectTypes.map((type, i) => `${i + 1}. ${type}`).join('\n')}

SENSITIVITY THRESHOLD: ${sensitivity} (0.0 = lenient, 1.0 = strict)

For each defect found, determine:
- TYPE: Which defect type from the list
- SEVERITY: "critical", "warning", or "info"
- CONFIDENCE: 0.0 to 1.0
- LOCATION: Where in the image (e.g., "top-left corner", "center area")
- DESCRIPTION: Brief explanation (1 sentence)

RESPOND ONLY IN THIS JSON FORMAT (no markdown, pure JSON):
{
  "defects": [
    {
      "type": "crack",
      "severity": "critical",
      "confidence": 0.92,
      "location": "center area",
      "description": "vertical crack approximately 15cm long"
    }
  ],
  "overall_status": "failed",
  "summary": "found 1 critical defect requiring immediate attention"
}

SEVERITY RULES:
- "critical" = structural damage, safety hazard, must fix immediately
- "warning" = visible damage, should fix soon
- "info" = minor cosmetic issue, monitor for progression

RULES:
- If no defects found → empty array, status "passed"
- If any critical defect → status "failed"
- If only warnings → status "needs_review"
- Be strict according to sensitivity level
- Only report defects with confidence > ${sensitivity}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.3
  });

  const content = response.choices[0].message.content || '{}';
  const cleanContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  try {
    const result = JSON.parse(cleanContent);
    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', cleanContent);
    throw new Error('AI returned invalid JSON format');
  }
}

export async function detectWeldQuality(
  imageUrl: string,
  config: any
): Promise<any> {
  const prompt = `Analyze this weld image. Return ONLY JSON, nothing else.

{
  "weldStatus": "acceptable",
  "overallQualityScore": 75,
  "standardCompliance": "passed",
  "defects": [
    {
      "type": "spatter",
      "severity": "minor",
      "location": "bead",
      "description": "Light spatter visible",
      "confidence": 0.85
    }
  ],
  "weldCharacteristics": {
    "appearance": "Good color and surface finish",
    "penetration": "good",
    "fusion": "complete",
    "uniformity": "uniform"
  },
  "recommendations": [
    "Clean spatter after inspection",
    "Maintain current technique"
  ],
  "summary": "Weld quality is acceptable per AWS D1.1"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }],
    max_tokens: 1000,
    temperature: 0.1
  });

  const content = response.choices[0].message.content || '{}';
  const cleanContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^[\s\n]*/, '')
    .replace(/[\s\n]*$/, '')
    .trim();

  try {
  const parsed = JSON.parse(cleanContent);
  console.log('✅ Weld JSON parsed successfully:', JSON.stringify(parsed).substring(0, 200));
  return parsed;
} catch (error) {
  console.error('❌ JSON Parse Error:');
  console.error('Raw content:', content.substring(0, 500));
  console.error('Cleaned content:', cleanContent.substring(0, 500));
  console.error('Error:', error);
  
  // Fallback - minimal response dönsün
  return {
    weldStatus: 'needs-review',
    overallQualityScore: 50,
    standardCompliance: 'failed',
    defects: [],
    weldCharacteristics: {
      appearance: 'Unable to analyze',
      penetration: 'unknown',
      fusion: 'unknown',
      uniformity: 'unknown'
    },
    recommendations: ['Retry with clearer image', 'Check lighting conditions'],
    summary: 'Analysis could not be completed'
  };
}
}
