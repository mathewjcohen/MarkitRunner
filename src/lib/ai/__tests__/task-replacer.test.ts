import { buildReplacementPrompt, parseReplacementTask } from '../task-replacer'
import type { Business, Channel } from '@/types'

const mockBusiness: Business = {
  id: 'b1',
  user_id: 'u1',
  name: 'Fretfolio',
  description: 'Gear management app for guitarists',
  type: 'saas_app',
  primary_goal: 'grow_audience',
  success_definition: '500 signups',
  content_themes: ['gear collecting', 'tone chasing', 'vintage guitars'],
  cold_start_notes: null,
  sort_order: 0,
  is_active: true,
  archived_at: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockMarketplaceChannel: Channel = {
  id: 'c1',
  business_id: 'b1',
  user_id: 'u1',
  type: 'marketplace',
  label: 'Reverb',
  cadence: 'weekly',
  platform_notes: 'Reverb.com — music gear sales only',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

describe('buildReplacementPrompt', () => {
  it('includes the rejected task title', () => {
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Post a community discussion thread')
    expect(prompt).toContain('Post a community discussion thread')
    expect(prompt).toContain('rejected')
  })

  it('includes platform context for marketplace', () => {
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Any task')
    expect(prompt).toContain('PHYSICAL GOODS only')
  })

  it('includes channel platform_notes', () => {
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Any task')
    expect(prompt).toContain('Reverb.com — music gear sales only')
  })

  it('includes scheduled date', () => {
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Any task')
    expect(prompt).toContain('2026-06-11')
  })

  it('includes previous rejections section when provided', () => {
    const previous = [{ title: 'Post a product walkthrough' }, { title: 'Share a customer testimonial' }]
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Any task', previous)
    expect(prompt).toContain('Previously rejected ideas')
    expect(prompt).toContain('Post a product walkthrough')
    expect(prompt).toContain('Share a customer testimonial')
  })

  it('omits previous rejections section when array is empty', () => {
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Any task', [])
    expect(prompt).not.toContain('Previously rejected ideas')
  })

  it('omits previous rejections section when not provided', () => {
    const prompt = buildReplacementPrompt('2026-06-11', mockBusiness, mockMarketplaceChannel, 'Any task')
    expect(prompt).not.toContain('Previously rejected ideas')
  })
})

describe('parseReplacementTask', () => {
  it('parses valid JSON response', () => {
    const raw = JSON.stringify({
      title: 'Update Reverb listing with new photos',
      description: 'Add 3 high-quality photos to your top-selling listing.',
    })
    const result = parseReplacementTask(raw)
    expect(result.title).toBe('Update Reverb listing with new photos')
    expect(result.description).toBe('Add 3 high-quality photos to your top-selling listing.')
  })

  it('strips markdown fences before parsing', () => {
    const raw = '```json\n{"title":"T","description":"D"}\n```'
    const result = parseReplacementTask(raw)
    expect(result.title).toBe('T')
  })

  it('throws on invalid JSON', () => {
    expect(() => parseReplacementTask('not json')).toThrow('not valid JSON')
  })

  it('throws when title is missing', () => {
    expect(() => parseReplacementTask(JSON.stringify({ description: 'D' }))).toThrow('missing title or description')
  })
})
