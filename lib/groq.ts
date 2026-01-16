import Groq from 'groq-sdk';

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true // Client-side kullanım için
});

// Retry helper for rate limiting
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimitError = 
        error.message?.includes('429') || 
        error.message?.includes('quota') ||
        error.message?.includes('Too Many Requests');
      
      if (isRateLimitError && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 2000; // 2s, 4s, 8s
        console.log(`⏳ Rate limit hit, bekliyor: ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

export interface RoadmapNode {
  title: string;
  description: string;
  estimated_duration: string;
  order_index: number;
  dependencies?: number[];
}

export async function generateRoadmap(
  projectTitle: string,
  projectDescription: string,
  domain: string
): Promise<RoadmapNode[]> {
  try {
    return await retryWithBackoff(async () => {
      const prompt = `
You are an expert project manager and technical consultant. Generate a detailed project roadmap for the following project:

Project Title: ${projectTitle}
Domain: ${domain}
Description: ${projectDescription}

Create a comprehensive roadmap with 8-12 milestones/phases. Each milestone should be a significant, achievable step in the project lifecycle.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation text - just raw JSON.

Return a JSON array of roadmap nodes with this exact structure:
[
  {
    "title": "Phase title",
    "description": "Detailed description of what needs to be accomplished in this phase",
    "estimated_duration": "2 weeks",
    "order_index": 0,
    "dependencies": []
  }
]

Requirements:
- Create 8-12 nodes
- order_index starts from 0
- estimated_duration should be realistic (in days, weeks, or months)
- dependencies is an array of order_index numbers that must be completed before this node
- First node should have empty dependencies []
- Later nodes can depend on earlier nodes (use their order_index)
- Make descriptions specific and actionable
- Consider the domain type (${domain}) for specialized phases

Return ONLY the JSON array, nothing else.
`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 4096,
      });

      const text = chatCompletion.choices[0]?.message?.content || '';

      // Clean the response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      // Parse the JSON response
      const roadmapNodes: RoadmapNode[] = JSON.parse(cleanedText);

      // Validate the structure
      if (!Array.isArray(roadmapNodes) || roadmapNodes.length < 5) {
        throw new Error('Invalid roadmap structure');
      }

      return roadmapNodes;
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Yapay zeka ile yol haritası oluşturulurken bir hata oluştu');
  }
}

export async function analyzeProjectProgress(
  projectDescription: string,
  completedNodes: number,
  totalNodes: number,
  recentActivities: string[]
): Promise<string> {
  try {
    const prompt = `
You are a project mentor providing brief, actionable feedback.

Project: ${projectDescription}
Progress: ${completedNodes}/${totalNodes} milestones completed
Recent Activities: ${recentActivities.join(', ')}

Provide a short analysis (2-3 sentences) covering:
1. Current progress assessment
2. One specific recommendation for next steps

Keep it concise and encouraging.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    return chatCompletion.choices[0]?.message?.content || 'İlerleme analizi şu anda kullanılamıyor.';
  } catch (error) {
    console.error('Error analyzing progress:', error);
    return 'İlerleme analizi şu anda kullanılamıyor.';
  }
}
