# OpenRouter Setup Guide

## Why OpenRouter?

OpenRouter provides **FREE** access to various AI models, making it perfect for this project since Anthropic's Claude doesn't offer a free tier.

## Getting Your Free API Key

### Step 1: Sign Up (Free!)

1. Go to https://openrouter.ai/
2. Click "Sign Up" or "Get Started"
3. Sign up with your email (Google sign-in also available)
4. Verify your email if required

### Step 2: Get API Key

1. Once logged in, go to https://openrouter.ai/keys
2. Click "Create Key" button
3. Give it a name (e.g., "Chronicle Query System")
4. Copy the generated API key

### Step 3: Add to Your Project

1. Open `/backend/.env` file
2. Replace `your_openrouter_api_key_here` with your actual API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
   ```
3. Save the file

### Step 4: Start the Backend

```bash
cd backend
npm run dev
```

## What's Changed?

### Model Used

- **Before**: Claude 3.5 Sonnet (paid, ~$3 per million tokens)
- **After**: Meta Llama 3.1 8B Instruct (FREE)

The free model is optimized for instruction following and should work well for SQL generation.

### Available Free Models on OpenRouter

OpenRouter offers several free models you can use:

- `meta-llama/llama-3.1-8b-instruct:free` (Current - Good for SQL)
- `google/gemma-2-9b-it:free` (Alternative)
- `microsoft/phi-3-mini-128k-instruct:free` (Lightweight)

To change the model, edit `/backend/src/services/ai.service.ts`:

```typescript
private readonly model = 'meta-llama/llama-3.1-8b-instruct:free';
```

## Free Tier Limits

OpenRouter's free tier includes:

- ✅ No credit card required
- ✅ Reasonable rate limits (sufficient for development)
- ✅ Access to multiple free models
- ⚠️ May have slower response times during peak hours
- ⚠️ Rate limits apply (but generous for development use)

## Testing Your Setup

1. Start the backend server
2. Open your browser to http://localhost:4200
3. Try a simple query: "Show me all available plots"
4. If it works, your OpenRouter setup is complete! 🎉

## Troubleshooting

### Error: "Invalid API Key"

- Double-check you copied the entire API key from OpenRouter
- Make sure there are no extra spaces in the `.env` file
- Restart the backend server after updating `.env`

### Error: "Model not available"

- The free model might be temporarily unavailable
- Try changing to another free model (see list above)

### Slow Responses

- Free tier models may be slower during peak usage
- This is normal for free services
- Consider upgrading to OpenRouter's paid tier if needed

## Cost Comparison

| Service               | Cost                      | Notes                             |
| --------------------- | ------------------------- | --------------------------------- |
| **OpenRouter (Free)** | $0.00                     | Perfect for development & testing |
| Anthropic Claude      | $3-15 per million tokens  | Requires credit card              |
| OpenAI GPT-4          | $10-60 per million tokens | Requires credit card              |

## Support

- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Discord: https://discord.gg/openrouter
- OpenRouter Status: https://status.openrouter.ai/

---

**Note**: If you need better performance in production, you can easily upgrade to paid models on OpenRouter or switch back to Claude by following the original setup instructions.
