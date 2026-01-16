/**
 * AI Service Router - Triple Model Architecture
 * 
 * Routes AI requests to appropriate provider based on:
 * - User tier (Free/Premium)
 * - Analysis type (Roadmap/Chat/Deep Analysis)
 * - Token requirements
 * 
 * Providers:
 * - Google Gemini 2.0 Flash: Free tier, roadmap generation
 * - GitHub DeepSeek-V3: Premium tier, deep analysis
 * - Groq Llama 3.3 70B: Fast chat responses
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import {
  UserTier,
  AIProvider,
  AnalysisType,
  AIModelConfig,
  AIAnalysisRequest,
  AIAnalysisResponse,
  ModelSelection,
  TextOptimizationOptions
} from '@/types/ai';

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

const MODELS: Record<string, AIModelConfig> = {
  GEMINI_FLASH: {
    provider: AIProvider.GOOGLE_GEMINI,
    modelName: 'gemini-2.0-flash-exp',
    maxTokens: 8000,
    temperature: 0.7,
    description: 'Google Gemini 2.0 Flash - Fast, high-quality roadmap generation',
    requiredTier: UserTier.FREE
  },
  DEEPSEEK_V3: {
    provider: AIProvider.GITHUB_DEEPSEEK,
    modelName: 'DeepSeek-R1',
    maxTokens: 16000,
    temperature: 0.8,
    description: 'GitHub DeepSeek R1 - Advanced reasoning and deep analysis',
    requiredTier: UserTier.PREMIUM
  },
  GROQ_LLAMA_70B: {
    provider: AIProvider.GROQ_LLAMA,
    modelName: 'llama-3.3-70b-versatile',
    maxTokens: 8000,
    temperature: 0.7,
    description: 'Groq Llama 3.3 70B - Ultra-fast chat responses',
    requiredTier: UserTier.FREE
  },
  GROQ_LLAMA_8B: {
    provider: AIProvider.GROQ_LLAMA,
    modelName: 'llama-3.1-8b-instant',
    maxTokens: 4000,
    temperature: 0.7,
    description: 'Groq Llama 3.1 8B - Instant quick analysis',
    requiredTier: UserTier.FREE
  }
};

// ============================================================================
// API CLIENT INITIALIZATION
// ============================================================================

let geminiClient: GoogleGenerativeAI | null = null;
let groqClient: Groq | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not configured');
  }
  return token;
}

// ============================================================================
// MODEL SELECTION LOGIC
// ============================================================================

export function selectAIModel(
  analysisType: AnalysisType,
  userTier: UserTier
): ModelSelection {
  let config: AIModelConfig;
  let reason: string;

  switch (analysisType) {
    case AnalysisType.ROADMAP:
      if (userTier === UserTier.PREMIUM) {
        config = MODELS.DEEPSEEK_V3;
        reason = 'Premium tier: Using DeepSeek V3 for advanced roadmap generation with strategic insights';
      } else {
        config = MODELS.GROQ_LLAMA_70B;
        reason = 'Free tier: Using Groq Llama 3.3 70B for ultra-fast roadmap generation';
      }
      break;

    case AnalysisType.DEEP_ANALYSIS:
      if (userTier === UserTier.PREMIUM) {
        config = MODELS.DEEPSEEK_V3;
        reason = 'Premium tier: Using DeepSeek V3 for deep technical and strategic analysis';
      } else {
        config = MODELS.GROQ_LLAMA_70B;
        reason = 'Free tier: Using Groq Llama 3.3 70B for comprehensive analysis';
      }
      break;

    case AnalysisType.CHAT:
      config = MODELS.GROQ_LLAMA_70B;
      reason = 'All users: Using Groq Llama 3.3 70B for ultra-fast chat responses';
      break;

    case AnalysisType.QUICK_ANALYSIS:
      config = MODELS.GROQ_LLAMA_8B;
      reason = 'All users: Using Groq Llama 3.1 8B for instant quick analysis';
      break;

    default:
      config = MODELS.GEMINI_FLASH;
      reason = 'Default: Using Gemini 2.0 Flash';
  }

  return { config, reason };
}

// ============================================================================
// TEXT OPTIMIZATION UTILITIES
// ============================================================================

export function cleanText(text: string, options: TextOptimizationOptions = {}): string {
  const {
    maxLength,
    preserveFormatting = false,
    removeUrls = true,
    removeEmails = true
  } = options;

  let cleaned = text;

  // Remove excessive whitespace
  if (!preserveFormatting) {
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }

  // Remove URLs
  if (removeUrls) {
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  }

  // Remove email addresses
  if (removeEmails) {
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  }

  // Truncate if needed
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...';
  }

  return cleaned;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

async function callGemini(
  prompt: string,
  config: AIModelConfig
): Promise<{ content: string; tokensUsed?: number }> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: config.modelName });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    },
  });

  const response = result.response;
  const content = response.text();

  return {
    content,
    tokensUsed: response.usageMetadata?.totalTokenCount
  };
}

async function callGroq(
  prompt: string,
  config: AIModelConfig
): Promise<{ content: string; tokensUsed?: number }> {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: config.modelName,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  });

  const content = completion.choices[0]?.message?.content || '';
  const tokensUsed = completion.usage?.total_tokens;

  return { content, tokensUsed };
}

async function callGitHubDeepSeek(
  prompt: string,
  config: AIModelConfig
): Promise<{ content: string; tokensUsed?: number }> {
  const token = getGitHubToken();

  const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical analyst and strategic planner. Provide deep, insightful analysis with actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: config.modelName,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens;

  return { content, tokensUsed };
}

// ============================================================================
// MAIN AI ANALYSIS FUNCTION
// ============================================================================

export async function analyzeWithAI(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  const startTime = Date.now();

  // Select appropriate model
  const { config, reason } = selectAIModel(request.analysisType, request.userTier);
  
  console.log(`[AI Router] ${reason}`);
  console.log(`[AI Router] Model: ${config.modelName} (${config.provider})`);

  // Apply custom parameters if provided
  const effectiveConfig: AIModelConfig = {
    ...config,
    maxTokens: request.maxTokens || config.maxTokens,
    temperature: request.temperature || config.temperature
  };

  // Optimize prompt
  const optimizedPrompt = cleanText(request.prompt, {
    maxLength: 50000, // Safety limit
    preserveFormatting: true,
    removeUrls: false,
    removeEmails: false
  });

  const estimatedTokens = estimateTokens(optimizedPrompt);
  console.log(`[AI Router] Prompt length: ${optimizedPrompt.length} chars (~${estimatedTokens} tokens)`);

  // Route to appropriate provider
  let result: { content: string; tokensUsed?: number };
  
  try {
    switch (config.provider) {
      case AIProvider.GOOGLE_GEMINI:
        result = await callGemini(optimizedPrompt, effectiveConfig);
        break;

      case AIProvider.GROQ_LLAMA:
        result = await callGroq(optimizedPrompt, effectiveConfig);
        break;

      case AIProvider.GITHUB_DEEPSEEK:
        result = await callGitHubDeepSeek(optimizedPrompt, effectiveConfig);
        break;

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  } catch (error) {
    console.error(`[AI Router] Provider error:`, error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const processingTime = Date.now() - startTime;

  console.log(`[AI Router] Success: ${result.content.length} chars, ${result.tokensUsed || 'N/A'} tokens, ${processingTime}ms`);

  return {
    content: result.content,
    provider: config.provider,
    model: config.modelName,
    tokensUsed: result.tokensUsed,
    processingTime
  };
}

// ============================================================================
// HELPER FUNCTIONS FOR SPECIFIC USE CASES
// ============================================================================

export async function generateRoadmapWithAI(
  projectName: string,
  description: string,
  categories: string[],
  userTier: UserTier,
  uploadedFileText?: string
): Promise<AIAnalysisResponse> {
  let prompt = `Generate a comprehensive project roadmap for: ${projectName}\n\n`;
  prompt += `Description: ${description}\n\n`;
  
  if (uploadedFileText) {
    const truncatedFile = truncateText(uploadedFileText, 5000);
    prompt += `Additional Context:\n${truncatedFile}\n\n`;
  }
  
  prompt += `Create a detailed roadmap with ${categories.length} categories: ${categories.join(', ')}\n\n`;
  prompt += `For each category, provide 6-10 actionable steps with realistic timelines and dependencies.`;

  return analyzeWithAI({
    prompt,
    analysisType: AnalysisType.ROADMAP,
    userTier,
    context: {
      projectName,
      description,
      uploadedFileText,
      categories
    }
  });
}

export async function chatWithAI(
  message: string,
  context?: string
): Promise<AIAnalysisResponse> {
  let prompt = message;
  
  if (context) {
    prompt = `Context: ${truncateText(context, 2000)}\n\nUser: ${message}`;
  }

  return analyzeWithAI({
    prompt,
    analysisType: AnalysisType.CHAT,
    userTier: UserTier.FREE, // Chat always uses Groq (free for all)
  });
}

export async function deepAnalyzeWithAI(
  subject: string,
  details: string,
  userTier: UserTier
): Promise<AIAnalysisResponse> {
  const prompt = `Perform a deep technical and strategic analysis:\n\nSubject: ${subject}\n\nDetails:\n${details}`;

  return analyzeWithAI({
    prompt,
    analysisType: AnalysisType.DEEP_ANALYSIS,
    userTier
  });
}
