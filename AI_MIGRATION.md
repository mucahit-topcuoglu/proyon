# ProYön AI Migration: Groq → SambaNova DeepSeek-R1

## Migration Summary
**Date**: 2025-01-18  
**Status**: ✅ Complete

### Changes Made

#### 1. AI Provider Change
- **Old**: Groq API with Llama 3.3 70B Versatile
- **New**: SambaNova API with DeepSeek-R1

#### 2. API Configuration
```typescript
// OLD (Groq)
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });

// NEW (SambaNova)
const SAMBANOVA_API_KEY = 'df827196-7c72-467a-88ae-99ba2ef39cb8';
const SAMBANOVA_BASE_URL = 'https://api.sambanova.ai/v1';
const MODEL_NAME = 'deepseek-r1';
```

#### 3. API Integration
- Changed from SDK-based (groq-sdk) to REST API (native fetch)
- Updated endpoint: `https://api.sambanova.ai/v1/chat/completions`
- Maintained OpenAI-compatible chat completions format

#### 4. Package Changes
```bash
# Removed
npm uninstall groq-sdk  # -22 packages

# No new packages needed (using native fetch)
```

#### 5. Preserved Features
✅ Turkish ProYön AI personality  
✅ Chat history support (last 5 messages)  
✅ Project context awareness  
✅ Node/step context  
✅ Date/time awareness  
✅ Error handling (rate limits, token limits)  
✅ Same function interface (`askProyonAI`)

#### 6. Files Modified
- `lib/proyonAI.ts` (269 lines)
  * Removed Groq SDK import
  * Added SambaNova configuration
  * Replaced SDK calls with fetch API
  * Updated error handling

### API Details

**SambaNova Configuration**:
- Model: `deepseek-r1` (alternative: `DeepSeek-R1-0528`)
- API Key: `df827196-7c72-467a-88ae-99ba2ef39cb8`
- Base URL: `https://api.sambanova.ai/v1`
- Temperature: 0.7
- Max Tokens: 2048
- Top P: 1.0

**Request Format** (OpenAI-compatible):
```json
{
  "model": "deepseek-r1",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "top_p": 1
}
```

### Testing Checklist

To verify the migration:

1. ✅ Code compiles without errors
2. ✅ groq-sdk removed successfully
3. ⏳ Open a project in dashboard
4. ⏳ Test ProYön AI chat
5. ⏳ Verify Turkish responses
6. ⏳ Test with project context
7. ⏳ Test with node context
8. ⏳ Check chat history works

### Notes

- API key is hardcoded in `lib/proyonAI.ts` (consider moving to env vars for production)
- SambaNova uses OpenAI-compatible API format
- No SDK required - using native fetch for HTTP requests
- Error messages preserved in Turkish for user experience

### Rollback Plan

If needed to rollback to Groq:

1. Install: `npm install groq-sdk`
2. Restore from git: `git checkout HEAD~1 -- lib/proyonAI.ts`
3. Update `.env.local` with Groq API key

### Next Steps

1. Test the AI chat in a live project
2. Monitor API response quality
3. Consider moving API key to environment variables
4. Check SambaNova API rate limits and quotas
