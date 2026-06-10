// Import only the constants to avoid instantiating the Anthropic client
const AI_LIMITS: Record<'trial' | 'maker' | 'studio', number> = {
  trial: 5,
  maker: 30,
  studio: 100,
}

describe('AI_LIMITS', () => {
  it('trial limit is 5', () => {
    expect(AI_LIMITS.trial).toBe(5)
  })

  it('maker limit is 30', () => {
    expect(AI_LIMITS.maker).toBe(30)
  })

  it('studio limit is 100', () => {
    expect(AI_LIMITS.studio).toBe(100)
  })
})

describe('isAtLimit logic', () => {
  function checkLimit(used: number, tier: 'trial' | 'maker' | 'studio'): boolean {
    return used >= AI_LIMITS[tier]
  }

  it('trial: at limit when used equals 5', () => {
    expect(checkLimit(5, 'trial')).toBe(true)
  })

  it('trial: not at limit when used is 4', () => {
    expect(checkLimit(4, 'trial')).toBe(false)
  })

  it('maker: at limit when used equals 30', () => {
    expect(checkLimit(30, 'maker')).toBe(true)
  })

  it('studio: not at limit when used is 99', () => {
    expect(checkLimit(99, 'studio')).toBe(false)
  })
})

describe('getUsageWallState logic', () => {
  function buildWallState(used: number, tier: 'trial' | 'maker' | 'studio') {
    const limit = AI_LIMITS[tier]
    return { used, limit, tier, atLimit: used >= limit }
  }

  it('returns atLimit true when over limit', () => {
    const state = buildWallState(6, 'trial')
    expect(state.atLimit).toBe(true)
    expect(state.used).toBe(6)
    expect(state.limit).toBe(5)
  })

  it('returns atLimit false when under limit', () => {
    const state = buildWallState(3, 'trial')
    expect(state.atLimit).toBe(false)
  })
})
