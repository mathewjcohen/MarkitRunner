import Anthropic from '@anthropic-ai/sdk'

export const AI_MODELS = {
  weekly_plan: 'claude-sonnet-4-6',
  daily_focus: 'claude-haiku-4-5-20251001',
  content_prompt: 'claude-haiku-4-5-20251001',
  onboarding: 'claude-haiku-4-5-20251001',
  cold_start: 'claude-haiku-4-5-20251001',
} as const satisfies Record<string, string>

export const AI_LIMITS: Record<'trial' | 'maker' | 'studio', number> = {
  trial: 5,
  maker: 30,
  studio: 100,
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
