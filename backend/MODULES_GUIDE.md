# Module Development Guide

## Create New Module

### 1. Create file: backend/src/modules/myModule.ts

```typescript
import { IInspectionModule } from '../types/module.types';

export const MyModule: IInspectionModule = {
  id: 'my-module',
  name: 'Module Name',
  description: 'What it does',
  category: 'vision',
  
  configSchema: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { type: 'string' } }
    },
    required: ['items']
  },
  
  async execute(input) {
    const { imageUrl, config } = input;
    
    // Your AI logic here
    
    return {
      status: 'success',
      confidence: 0.95,
      findings: [...],
      summary: 'Result summary'
    };
  }
};
```

### 2. Add AI function to backend/src/services/aiService.ts

```typescript
export async function myAiFunction(imageUrl: string, config: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: [...] }]
  });
  
  const content = response.choices[0].message.content || '{}';
  const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(clean);
}
```

### 3. Create templates: backend/src/modules/myModule.templates.ts

```typescript
export const defaultMyModuleTemplates = [
  {
    moduleId: 'my-module',
    name: 'Template 1',
    config: { items: ['item1', 'item2'] },
    isPublic: true,
    createdBy: 'system'
  }
];
```

### 4. Register in backend/src/modules/index.ts

Add to registerAllModules():
moduleRegistry.register(MyModule);

Add templates to seedDefaultTemplates() array.

### 5. Deploy

git add .
git commit -m "Add: My Module"
git push origin main
