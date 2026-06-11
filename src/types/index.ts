export type Tier = 'trial' | 'maker' | 'studio'

export type BusinessType =
  | 'saas_app'
  | 'mobile_app'
  | 'physical_product'
  | 'artisan_craft'
  | 'service_business'
  | 'content_creator'
  | 'community'
  | 'other'

export type PrimaryGoal =
  | 'grow_audience'
  | 'drive_sales'
  | 'build_community'
  | 'increase_awareness'
  | 'get_feedback'
  | 'launch_something'

export type ChannelType =
  | 'discord'
  | 'instagram'
  | 'youtube'
  | 'email_newsletter'
  | 'reddit'
  | 'tiktok'
  | 'linkedin'
  | 'facebook'
  | 'forum'
  | 'marketplace'
  | 'website_blog'

export type Cadence = 'daily' | 'weekly' | '2x_week' | 'monthly'

export type MetricCategory = 'app' | 'content' | 'community' | 'sales' | 'custom'

export type AIActionType =
  | 'weekly_plan'
  | 'daily_focus'
  | 'content_prompt'
  | 'onboarding'
  | 'cold_start'

export interface User {
  id: string
  email: string
  created_at: string
  tier: Tier
  trial_started_at: string | null
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  deletion_scheduled_at: string | null
}

export interface Profile {
  id: string
  display_name: string | null
  ai_actions_used: number
  ai_actions_reset_at: string | null
  onboarding_complete: boolean
  week_start_day: number
  updated_at: string
}

export interface Business {
  id: string
  user_id: string
  name: string
  description: string
  type: BusinessType
  primary_goal: PrimaryGoal
  success_definition: string
  content_themes: string[]
  cold_start_notes: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  archived_at: string | null
}

export interface Channel {
  id: string
  business_id: string
  user_id: string
  type: ChannelType
  label: string | null
  cadence: Cadence
  is_active: boolean
  created_at: string
}

export interface Task {
  id: string
  business_id: string
  channel_id: string
  user_id: string
  plan_id: string | null
  title: string
  description: string | null
  scheduled_date: string
  completed_at: string | null
  deferred_count: number
  ai_prompt_angle: string | null
  ai_prompt_opening: string | null
  ai_prompt_generated_at: string | null
  created_at: string
}

export interface GeneratedPlan {
  id: string
  business_id: string
  user_id: string
  week_start: string
  plan_json: WeeklyPlanOutput
  generated_at: string
  model_used: string
}

export interface WeeklyPlanTask {
  title: string
  description: string
  channel_type: ChannelType
  scheduled_date: string
}

export interface WeeklyPlanOutput {
  tasks: WeeklyPlanTask[]
  summary: string
}

export interface MetricSnapshot {
  id: string
  business_id: string
  user_id: string
  metric_key: string
  metric_label: string
  metric_category: MetricCategory
  value: number
  recorded_at: string
}

export interface UsageEvent {
  id: string
  user_id: string
  action_type: AIActionType
  business_id: string | null
  model_used: string
  created_at: string
}

export const AI_ACTION_LIMITS: Record<Tier, number> = {
  trial: 100,
  maker: 100,
  studio: 500,
}

export const CHANNEL_LIMITS: Record<Tier, number | null> = {
  trial: 3,
  maker: 3,
  studio: null,
}

export const BUSINESS_LIMITS: Record<Tier, number | null> = {
  trial: 3,
  maker: 3,
  studio: null,
}
