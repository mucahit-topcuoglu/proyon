/**
 * AI Service Type Definitions
 * Triple-Model Architecture: Free (Gemini) + Premium (DeepSeek) + Chat (Groq)
 */

// User tier system for AI access control
export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium'
}

// AI provider identifiers
export enum AIProvider {
  GOOGLE_GEMINI = 'google_gemini',
  GITHUB_DEEPSEEK = 'github_deepseek',
  GROQ_LLAMA = 'groq_llama'
}

// Analysis types for routing decisions
export enum AnalysisType {
  ROADMAP = 'roadmap',           // Full roadmap generation
  DEEP_ANALYSIS = 'deep_analysis', // Strategic/technical deep dive
  CHAT = 'chat',                 // Interactive chat responses
  QUICK_ANALYSIS = 'quick_analysis' // Fast insights
}

// AI model configuration
export interface AIModelConfig {
  provider: AIProvider;
  modelName: string;
  maxTokens: number;
  temperature: number;
  description: string;
  requiredTier: UserTier;
}

// Request structure for AI analysis
export interface AIAnalysisRequest {
  prompt: string;
  analysisType: AnalysisType;
  userTier: UserTier;
  maxTokens?: number;
  temperature?: number;
  context?: {
    projectName?: string;
    description?: string;
    uploadedFileText?: string;
    categories?: string[];
  };
}

// Response structure from AI analysis
export interface AIAnalysisResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  cached?: boolean;
}

// Token optimization utilities interface
export interface TextOptimizationOptions {
  maxLength?: number;
  preserveFormatting?: boolean;
  removeUrls?: boolean;
  removeEmails?: boolean;
}

// Tier upgrade tracking
export interface TierUpgrade {
  userId: string;
  fromTier: UserTier;
  toTier: UserTier;
  upgradedAt: Date;
  expiresAt?: Date;
  paymentId?: string;
}

// Model selection result
export interface ModelSelection {
  config: AIModelConfig;
  reason: string;
}
