import '@testing-library/jest-dom'
import { configureAxe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

configureAxe({
  rules: {
    // CSS custom properties resolve to nothing in jsdom — disable computed color contrast
    'color-contrast': { enabled: false },
  },
})
