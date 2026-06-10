import { validateBusinessInput, validateChannelCount } from '@/actions/businesses'
import { BUSINESS_LIMITS, CHANNEL_LIMITS } from '@/types'

describe('validateBusinessInput', () => {
  it('rejects empty name', () => {
    const result = validateBusinessInput({ name: '', description: 'x', type: 'saas_app' })
    expect(result).toBe('Name is required')
  })

  it('rejects content_themes with fewer than 3', () => {
    const result = validateBusinessInput({
      name: 'Test',
      description: 'x',
      type: 'saas_app',
      content_themes: ['a', 'b'],
    })
    expect(result).toBe('Exactly 3 content themes required')
  })

  it('accepts valid input', () => {
    const result = validateBusinessInput({
      name: 'Fretfolio',
      description: 'Guitar app',
      type: 'saas_app',
      content_themes: ['a', 'b', 'c'],
    })
    expect(result).toBeNull()
  })
})

describe('validateChannelCount', () => {
  it('blocks Maker adding 4th channel', () => {
    expect(validateChannelCount('maker', 3)).toBe('Maker plan allows 3 channels per business')
  })

  it('allows Studio unlimited channels', () => {
    expect(validateChannelCount('studio', 99)).toBeNull()
  })
})
