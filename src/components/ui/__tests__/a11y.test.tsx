/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { UsageBar } from '../UsageBar'
import { TrialBanner } from '../TrialBanner'

describe('a11y: UsageBar', () => {
  it('has no violations at zero usage', async () => {
    const { container } = render(<UsageBar used={0} limit={5} tier="trial" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations near limit', async () => {
    const { container } = render(<UsageBar used={4} limit={5} tier="maker" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations at limit with upgrade link', async () => {
    const { container } = render(<UsageBar used={5} limit={5} tier="trial" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('a11y: TrialBanner', () => {
  it('has no violations when banner is shown', async () => {
    const { container } = render(<TrialBanner daysLeft={3} tier="trial" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders nothing when tier is not trial', () => {
    const { container } = render(<TrialBanner daysLeft={3} tier="maker" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when daysLeft is 0', () => {
    const { container } = render(<TrialBanner daysLeft={0} tier="trial" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when more than 7 days left', () => {
    const { container } = render(<TrialBanner daysLeft={14} tier="trial" />)
    expect(container).toBeEmptyDOMElement()
  })
})
