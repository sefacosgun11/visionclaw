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
): Promise<{
  weldStatus: 'acceptable' | 'conditional' | 'rejected';
  overallQualityScore: number;
  standardCompliance: 'passed' | 'failed';
  defects: Array<{
    type: string;
    severity: 'critical' | 'major' | 'minor';
    location: string;
    description: string;
    confidence: number;
  }>;
  weldCharacteristics: {
    appearance: string;
    penetration: string;
    fusion: string;
    uniformity: string;
  };
  recommendations: string[];
  summary: string;
}> {
  const prompt = `
You are an expert certified welding inspector with 15+ years experience in industrial welding quality control.

### TASK
Analyze this weld image professionally according to the specified standard. Provide detailed technical assessment.

### WELDING STANDARDS REFERENCE

#### AWS D1.1 Acceptance Criteria:
- Visual surface: No cracks, undercut max 1/32", no spatter in joint
- Weld size: ±1/8" tolerance
- Porosity: None visible on surface
- Penetration: Full penetration for structural welds

#### Quality Levels (AWS D1.1):
- COMPLETE JOINT PENETRATION (CJP): No defects allowed
- PARTIAL JOINT PENETRATION (PJP): Minor surface defects allowed
- FILLET WELDS: Surface defects ≤ limits based on size

### COMMON WELD DEFECTS TO IDENTIFY:

1. **CRACKS** (Critical - Always Reject)
   - Longitudinal cracks: Along weld centerline
   - Transverse cracks: Across weld direction
   - Heat Affected Zone (HAZ) cracks: At edges
   - Visual: Dark lines, sharp edges

2. **POROSITY** (Defect Type)
   - Cause: Gas entrapment during solidification
   - Appearance: Round/oval holes in surface
   - Severity: Depends on size and frequency
   - Critical if: >3mm diameter or multiple

3. **LACK OF PENETRATION (LOP)** (Major Defect)
   - Root beads not fused to base metal
   - Visual: Gap visible between weld and base metal
   - Appearance: Linear defect at weld root

4. **LACK OF FUSION** (Major Defect)
   - Weld not bonded to side walls or previous pass
   - Visual: Discontinuity line visible
   - Causes: Insufficient heat, contamination

5. **UNDERCUT** (Defect)
   - Base metal eroded below weld surface
   - Visual: Notch at weld toe
   - Severity: <1/32" = acceptable, >1/32" = reject

6. **OVERLAP/OVERLAP** (Minor Defect)
   - Weld metal extends beyond intended edge
   - Visual: Extra material at toe
   - Cosmetic but may cause service issues

7. **SPATTER**
   - Molten metal drops outside joint
   - Easy to remove - minor issue
   - Doesn't affect strength

8. **INCOMPLETE FILLING**
   - Weld doesn't fill groove completely
   - Visual: Valley visible in weld surface
   - Reject: Reduces cross-sectional area

### WELD BEAD CHARACTERISTICS TO ASSESS:

1. **Appearance**
   - Color: Bright = good penetration, Dark = oxidation
   - Surface: Smooth ripples = good technique
   - Spatter: Present/absent
   - Oxidation: Light = normal, Heavy = problem

2. **Uniformity**
   - Bead width: Consistent along length
   - Bead height: Even peaks and valleys
   - Direction: Straight path
   - Overlap/Undercut: Visible defects

3. **Fusion Quality** (Visual Indicators)
   - Sharp toe angle: Good fusion
   - Rounded toe: Possible lack of fusion
   - Clear bead edges: Complete fusion
   - Blended edges: Excellent fusion

4. **Penetration Indicators**
   - Back beads visible: Full penetration
   - Reinforcement height: 1/8" - 3/16" typical
   - Root area: No visible gap between bead and base

### ASSESSMENT PROCESS:

1. Examine surface for visible defects (cracks, porosity, spatter)
2. Assess bead uniformity and appearance
3. Evaluate fusion at weld edges (toes)
4. Estimate penetration from visual indicators
5. Compare to standard acceptance criteria
6. Assign quality level and recommendations

### YOUR ANALYSIS FOR THIS IMAGE:

Config: ${config.weldType || 'GMAW'} | Standard: ${config.standard || 'AWS D1.1'} | Material: ${config.baseMaterial || 'Carbon Steel'}

Return ONLY this exact JSON structure (no markdown):
{
  "weldStatus": "acceptable|conditional|rejected",
  "overallQualityScore": NUMBER_0_to_100,
  "standardCompliance": "passed|failed",
  "defects": [
    {
      "type": "crack|porosity|lack_of_penetration|lack_of_fusion|undercut|overlap|spatter|incomplete_filling",
      "severity": "critical|major|minor",
      "location": "root|toe|cap|bead|HAZ|centerline|sidewall",
      "description": "DETAILED TECHNICAL DESCRIPTION",
      "confidence": NUMBER_0_to_1,
      "evidence": "SPECIFIC VISUAL EVIDENCE"
    }
  ],
  "weldCharacteristics": {
    "appearance": "DETAILED COLOR, SURFACE, SPATTER ASSESSMENT",
    "penetration": "excellent|good|fair|poor|unknown",
    "fusion": "complete|partial|incomplete|unknown",
    "uniformity": "uniform|slight_variation|poor",
    "bead_profile": "DESCRIPTION OF BEAD SHAPE AND SIZE"
  },
  "recommendations": [
    "SPECIFIC ACTIONABLE IMPROVEMENT #1",
    "SPECIFIC ACTIONABLE IMPROVEMENT #2"
  ],
  "summary": "PROFESSIONAL SUMMARY FOR CLIENT"
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }],
    max_tokens: 1500,
    temperature: 0.2
  });

  const content = response.choices[0].message.content || '{}';
  const cleanContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    return JSON.parse(cleanContent);
  } catch (error) {
    throw new Error('Weld analysis AI returned invalid JSON format');
  }
}
