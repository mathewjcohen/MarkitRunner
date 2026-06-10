describe('supabase clients export correctly', () => {
  it('server module exports createClient', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const mod = await import('@/lib/supabase/server')
    expect(typeof mod.createClient).toBe('function')
  })
})
