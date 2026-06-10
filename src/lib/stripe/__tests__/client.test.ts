import { getTierFromPriceId, PRICE_IDS } from '../client'

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({}))
})

describe('getTierFromPriceId', () => {
  it('returns maker for maker_monthly', () => {
    expect(getTierFromPriceId(PRICE_IDS.maker_monthly)).toBe('maker')
  })

  it('returns maker for maker_yearly', () => {
    expect(getTierFromPriceId(PRICE_IDS.maker_yearly)).toBe('maker')
  })

  it('returns studio for studio_monthly', () => {
    expect(getTierFromPriceId(PRICE_IDS.studio_monthly)).toBe('studio')
  })

  it('returns studio for studio_yearly', () => {
    expect(getTierFromPriceId(PRICE_IDS.studio_yearly)).toBe('studio')
  })

  it('returns null for unknown price', () => {
    expect(getTierFromPriceId('price_unknown')).toBeNull()
  })
})
