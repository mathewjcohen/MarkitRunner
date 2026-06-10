import { promises as fs } from 'fs'
import path from 'path'

describe('middleware routing', () => {
  it('middleware file exists and has correct exports', async () => {
    const middlewarePath = path.join(__dirname, '../middleware.ts')
    const content = await fs.readFile(middlewarePath, 'utf-8')

    expect(content).toContain('export async function middleware')
    expect(content).toContain('export const config')
  })
})
