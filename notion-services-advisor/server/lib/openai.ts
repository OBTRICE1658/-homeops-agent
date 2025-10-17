import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.warn('⚠️  OPENAI_API_KEY not configured - AI features will be disabled')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key-for-demo',
})

export const OPENAI_MODEL = 'gpt-4-1106-preview' // Using GPT-4 Turbo as gpt-5.1-mini doesn't exist yet
export const OPENAI_TEMPERATURE = 0.3
