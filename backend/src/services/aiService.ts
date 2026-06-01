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
  const systemPrompt = `You are a certified AWS D1.1 welding inspector with 20+ years experience.
Your ONLY job is to return a JSON response about weld quality.
You MUST return ONLY valid JSON. Nothing else. No explanations, no text.`;

  const userPrompt = `Analyze this weld image for quality control.

RESPOND WITH ONLY THIS JSON STRUCTURE (no other text):
{
  "weldStatus": "acceptable|conditional|rejected",
  "overallQualityScore": 0-100,
  "standardCompliance": "passed|failed",
  "defects": [
    {
      "type": "crack|porosity|undercut|spatter|overlap|lack_of_fusion|lack_of_penetration|incomplete_filling",
      "severity": "critical|major|minor",
      "location": "root|toe|cap|bead|HAZ|centerline",
      "description": "specific observable defect",
      "confidence": 0.0-1.0
    }
  ],
  "weldCharacteristics": {
    "appearance": "surface quality description",
    "penetration": "excellent|good|fair|poor|unknown",
    "fusion": "complete|partial|incomplete|unknown",
    "uniformity": "uniform|slight_variation|poor|unknown"
  },
  "recommendations": ["recommendation 1", "recommendation 2"],
  "summary": "one sentence professional assessment"
}

ANALYZE:
- Weld bead color and surface finish
- Visible cracks, porosity, spatter
- Bead uniformity and consistency
- Fusion at weld toes
- Overall appearance per AWS D1.1

Standard: ${config.standard || 'AWS D1.1'}
Weld Type: ${config.weldType || 'GMAW'}
Base Material: ${config.baseMaterial || 'Carbon Steel'}`;

  const timestamp = new Date().toISOString();
  const module = 'WeldQualityControl';

  try {
    console.log(`[${timestamp}] [${module}] INFO: Analyzing weld image...`);
    let content = '';
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1200,
      temperature: 0.0
    });

    content = response.choices[0].message.content || '{}';
    
    // Aggressive cleaning
    let cleanContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Extract JSON if wrapped in other text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    const result = JSON.parse(cleanContent);
    console.log(`[${timestamp}] [${module}] INFO: JSON response parsed successfully (score: ${result.overallQualityScore})`);
    
    // Validate structure
    if (!result.weldStatus || !result.overallQualityScore) {
      throw new Error('Invalid response structure');
    }

    // Transform to ModuleExecutionResult format
    const mappedResult = {
      status: result.weldStatus === 'acceptable' ? 'success' : 'failed',
      confidence: result.overallQualityScore / 100,
      findings: [
        {
          id: 'quality-score',
          type: 'quality_assessment',
          label: 'Quality Score',
          value: `${result.overallQualityScore}/100`,
          status: result.weldStatus === 'acceptable' ? 'success' : 'failed',
          confidence: result.overallQualityScore / 100
        },
        {
          id: 'compliance',
          type: 'compliance',
          label: `${config.standard || 'AWS D1.1'} Compliance`,
          value: result.standardCompliance,
          status: result.standardCompliance === 'passed' ? 'success' : 'failed',
          confidence: 0.95
        },
        ...(result.defects || []).map((defect: any, i: number) => ({
          id: `defect-${i}`,
          type: defect.type,
          label: `${defect.type.replace(/_/g, ' ').toUpperCase()}`,
          value: `${defect.severity}`,
          location: defect.location,
          description: defect.description,
          status: defect.severity === 'critical' ? 'failed' : 'warning',
          confidence: defect.confidence
        }))
      ],
      summary: result.summary,
      metadata: {
        weldCharacteristics: result.weldCharacteristics,
        recommendations: result.recommendations,
        standard: config.standard || 'AWS D1.1',
        weldType: config.weldType || 'GMAW'
      }
    };
    
    console.log(`[${timestamp}] [${module}] INFO: Weld analysis completed (${result.weldStatus})`);
    return mappedResult;
  } catch (error) {
    const timestamp = new Date().toISOString();
    const module = 'WeldQualityControl';
    
    console.error(`[${timestamp}] [${module}] ERROR: JSON parse failed`);
    // @ts-ignore - content might not be defined if API failed
    if (typeof content !== 'undefined' && content) {
      // @ts-ignore
      console.error(`[${timestamp}] [${module}] ERROR: Raw response: ${content.substring(0, 200)}`);
    } else {
      console.error(`[${timestamp}] [${module}] ERROR: Error details: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    throw new Error(`Weld analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
