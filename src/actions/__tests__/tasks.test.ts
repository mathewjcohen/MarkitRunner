import { buildWeekRange } from '@/lib/utils/date'
import { replaceTask } from '@/actions/tasks'
import * as taskReplacer from '@/lib/ai/task-replacer'
import { createClient } from '@/lib/supabase/server'
import { anthropic, AI_MODELS } from '@/lib/ai/anthropic'
import { revalidatePath } from 'next/cache'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/ai/task-replacer')
jest.mock('@/lib/ai/anthropic')
jest.mock('next/cache')

describe('buildWeekRange', () => {
  it('returns Monday to Sunday for a given week start', () => {
    const { start, end } = buildWeekRange('2026-06-09') // June 9, 2026 is a Tuesday
    expect(start).toBe('2026-06-08') // Monday
    expect(end).toBe('2026-06-14')   // Sunday
  })

  it('handles Sunday input by going back to Monday', () => {
    const { start, end } = buildWeekRange('2026-06-14') // Sunday
    expect(start).toBe('2026-06-08')
    expect(end).toBe('2026-06-14')
  })
})

describe('replaceTask', () => {
  const mockUserId = 'test-user-id'
  const mockBusinessId = 'test-business-id'
  const mockChannelId = 'test-channel-id'
  const mockTaskId = 'test-task-id'

  const mockTask = {
    id: mockTaskId,
    business_id: mockBusinessId,
    channel_id: mockChannelId,
    user_id: mockUserId,
    title: 'Original Task',
    description: 'Original description',
    scheduled_date: '2026-06-21',
    replaced_at: null,
    plan_id: null,
    deferred_count: 0,
    completed_at: null,
    ai_prompt_angle: null,
    ai_prompt_opening: null,
    ai_prompt_generated_at: null,
    created_at: '2026-06-01T00:00:00Z',
    businesses: {
      id: mockBusinessId,
      name: 'Test Business',
      description: 'Test business description',
      type: 'saas_app',
      primary_goal: 'grow_audience',
      success_definition: 'Increase followers',
      content_themes: ['theme1', 'theme2', 'theme3'],
      cold_start_notes: null,
      sort_order: 0,
      is_active: true,
      created_at: '2026-06-01T00:00:00Z',
      archived_at: null,
      user_id: mockUserId,
    },
    channels: {
      id: mockChannelId,
      business_id: mockBusinessId,
      user_id: mockUserId,
      type: 'instagram',
      label: 'Main Account',
      cadence: 'daily',
      platform_notes: 'Focus on reels',
      is_active: true,
      created_at: '2026-06-01T00:00:00Z',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns error when not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const result = await replaceTask(mockTaskId)
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when task not found', async () => {
    const mockEqSecondChain = {
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const mockSelectChain = {
      eq: jest.fn().mockReturnValue(mockEqSecondChain),
    }
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(mockSelectChain),
        }),
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const result = await replaceTask(mockTaskId)
    expect(result).toEqual({ error: 'Task not found' })
  })

  it('returns error when task already replaced', async () => {
    const mockEqSecondChain = {
      single: jest.fn().mockResolvedValue({
        data: { ...mockTask, replaced_at: '2026-06-20T00:00:00Z' },
        error: null,
      }),
    }
    const mockSelectChain = {
      eq: jest.fn().mockReturnValue(mockEqSecondChain),
    }
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(mockSelectChain),
        }),
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const result = await replaceTask(mockTaskId)
    expect(result).toEqual({ error: 'Task already replaced' })
  })

  it('inserts rejection to rejected_ideas with correct fields', async () => {
    const mockTasksEqSecondChain = {
      single: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
    }
    const mockTasksSelectChain = {
      eq: jest.fn().mockReturnValue(mockTasksEqSecondChain),
    }
    const mockTasksUpdateFirstEqChain = {
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const mockTasksUpdateChain = {
      eq: jest.fn().mockReturnValue(mockTasksUpdateFirstEqChain),
    }
    const mockRejectionOrderChain = {
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }
    const mockRejectionSecondEqChain = {
      eq: jest.fn().mockReturnValue(mockRejectionOrderChain),
    }
    const mockRejectionSelectChain = {
      eq: jest.fn().mockReturnValue(mockRejectionSecondEqChain),
    }

    const tasksInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })
    const rejectedIdeasInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn((tableName: string) => {
        if (tableName === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockTasksSelectChain),
            }),
            update: jest.fn().mockReturnValue(mockTasksUpdateChain),
            insert: tasksInsertMock,
          }
        }
        if (tableName === 'rejected_ideas') {
          return {
            insert: rejectedIdeasInsertMock,
            select: jest.fn().mockReturnValue(mockRejectionSelectChain),
          }
        }
        return {}
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(taskReplacer.buildReplacementPrompt as jest.Mock).mockReturnValue(
      'Test prompt'
    )
    ;(taskReplacer.parseReplacementTask as jest.Mock).mockReturnValue({
      title: 'Replacement title',
      description: 'Replacement description',
    })
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '{"title":"Replacement title","description":"Replacement description"}' }],
    })
    ;(revalidatePath as jest.Mock).mockImplementation(() => {})

    await replaceTask(mockTaskId)

    expect(rejectedIdeasInsertMock).toHaveBeenCalledWith({
      business_id: mockBusinessId,
      channel_id: mockChannelId,
      user_id: mockUserId,
      title: mockTask.title,
    })
  })

  it('fetches channel-scoped rejections filtered by business_id and channel_id', async () => {
    const mockRejections = [
      { title: 'Rejected idea 1' },
      { title: 'Rejected idea 2' },
    ]

    const mockTasksEqSecondChain = {
      single: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
    }
    const mockTasksSelectChain = {
      eq: jest.fn().mockReturnValue(mockTasksEqSecondChain),
    }
    const mockTasksUpdateFirstEqChain = {
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const mockTasksUpdateChain = {
      eq: jest.fn().mockReturnValue(mockTasksUpdateFirstEqChain),
    }
    const mockRejectionOrderChain = {
      order: jest.fn().mockResolvedValue({ data: mockRejections, error: null }),
    }
    const mockRejectionSecondEqChain = {
      eq: jest.fn().mockReturnValue(mockRejectionOrderChain),
    }
    const mockRejectionSelectChain = {
      eq: jest.fn().mockReturnValue(mockRejectionSecondEqChain),
    }

    const tasksInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })
    const rejectedIdeasInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })
    const selectMock = jest.fn().mockReturnValue(mockRejectionSelectChain)

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn((tableName: string) => {
        if (tableName === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockTasksSelectChain),
            }),
            update: jest.fn().mockReturnValue(mockTasksUpdateChain),
            insert: tasksInsertMock,
          }
        }
        if (tableName === 'rejected_ideas') {
          return {
            insert: rejectedIdeasInsertMock,
            select: selectMock,
          }
        }
        return {}
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(taskReplacer.buildReplacementPrompt as jest.Mock).mockReturnValue(
      'Test prompt'
    )
    ;(taskReplacer.parseReplacementTask as jest.Mock).mockReturnValue({
      title: 'Replacement title',
      description: 'Replacement description',
    })
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '{"title":"Replacement title","description":"Replacement description"}' }],
    })
    ;(revalidatePath as jest.Mock).mockImplementation(() => {})

    await replaceTask(mockTaskId)

    expect(selectMock).toHaveBeenCalledWith('title')
    expect(mockRejectionSelectChain.eq).toHaveBeenCalledWith('business_id', mockBusinessId)
    expect(mockRejectionSecondEqChain.eq).toHaveBeenCalledWith('channel_id', mockChannelId)
  })

  it('passes rejection history as 5th argument to buildReplacementPrompt', async () => {
    const mockRejections = [
      { title: 'Rejected idea 1' },
      { title: 'Rejected idea 2' },
    ]

    const mockTasksEqSecondChain = {
      single: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
    }
    const mockTasksSelectChain = {
      eq: jest.fn().mockReturnValue(mockTasksEqSecondChain),
    }
    const mockTasksUpdateFirstEqChain = {
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const mockTasksUpdateChain = {
      eq: jest.fn().mockReturnValue(mockTasksUpdateFirstEqChain),
    }
    const mockRejectionOrderChain = {
      order: jest.fn().mockResolvedValue({ data: mockRejections, error: null }),
    }
    const mockRejectionSecondEqChain = {
      eq: jest.fn().mockReturnValue(mockRejectionOrderChain),
    }
    const mockRejectionSelectChain = {
      eq: jest.fn().mockReturnValue(mockRejectionSecondEqChain),
    }

    const tasksInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })
    const rejectedIdeasInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn((tableName: string) => {
        if (tableName === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockTasksSelectChain),
            }),
            update: jest.fn().mockReturnValue(mockTasksUpdateChain),
            insert: tasksInsertMock,
          }
        }
        if (tableName === 'rejected_ideas') {
          return {
            insert: rejectedIdeasInsertMock,
            select: jest.fn().mockReturnValue(mockRejectionSelectChain),
          }
        }
        return {}
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(taskReplacer.buildReplacementPrompt as jest.Mock).mockReturnValue(
      'Test prompt'
    )
    ;(taskReplacer.parseReplacementTask as jest.Mock).mockReturnValue({
      title: 'Replacement title',
      description: 'Replacement description',
    })
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '{"title":"Replacement title","description":"Replacement description"}' }],
    })
    ;(revalidatePath as jest.Mock).mockImplementation(() => {})

    await replaceTask(mockTaskId)

    expect(taskReplacer.buildReplacementPrompt).toHaveBeenCalledWith(
      mockTask.scheduled_date,
      mockTask.businesses,
      mockTask.channels,
      mockTask.title,
      mockRejections
    )
  })

  it('succeeds when channel is inactive', async () => {
    const inactiveChannelTask = {
      ...mockTask,
      channels: { ...mockTask.channels, is_active: false },
    }

    const mockTasksEqSecondChain = {
      single: jest.fn().mockResolvedValue({ data: inactiveChannelTask, error: null }),
    }
    const mockTasksSelectChain = {
      eq: jest.fn().mockReturnValue(mockTasksEqSecondChain),
    }
    const mockTasksUpdateFirstEqChain = {
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const mockTasksUpdateChain = {
      eq: jest.fn().mockReturnValue(mockTasksUpdateFirstEqChain),
    }

    const rejectedIdeasInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn((tableName: string) => {
        if (tableName === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockTasksSelectChain),
            }),
            update: jest.fn().mockReturnValue(mockTasksUpdateChain),
          }
        }
        if (tableName === 'rejected_ideas') {
          return {
            insert: rejectedIdeasInsertMock,
          }
        }
        return {}
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(revalidatePath as jest.Mock).mockImplementation(() => {})

    const result = await replaceTask(mockTaskId)
    expect(result).toEqual({ success: true })
    expect(taskReplacer.buildReplacementPrompt).not.toHaveBeenCalled()
  })

  it('inserts new replacement task after AI generation', async () => {
    const mockTasksEqSecondChain = {
      single: jest.fn().mockResolvedValue({ data: mockTask, error: null }),
    }
    const mockTasksSelectChain = {
      eq: jest.fn().mockReturnValue(mockTasksEqSecondChain),
    }
    const mockTasksUpdateFirstEqChain = {
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const mockTasksUpdateChain = {
      eq: jest.fn().mockReturnValue(mockTasksUpdateFirstEqChain),
    }
    const mockRejectionOrderChain = {
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }
    const mockRejectionSecondEqChain = {
      eq: jest.fn().mockReturnValue(mockRejectionOrderChain),
    }
    const mockRejectionSelectChain = {
      eq: jest.fn().mockReturnValue(mockRejectionSecondEqChain),
    }

    const tasksInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })
    const rejectedIdeasInsertMock = jest.fn().mockResolvedValue({ data: null, error: null })

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: jest.fn((tableName: string) => {
        if (tableName === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockTasksSelectChain),
            }),
            update: jest.fn().mockReturnValue(mockTasksUpdateChain),
            insert: tasksInsertMock,
          }
        }
        if (tableName === 'rejected_ideas') {
          return {
            insert: rejectedIdeasInsertMock,
            select: jest.fn().mockReturnValue(mockRejectionSelectChain),
          }
        }
        return {}
      }),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(taskReplacer.buildReplacementPrompt as jest.Mock).mockReturnValue(
      'Test prompt'
    )
    ;(taskReplacer.parseReplacementTask as jest.Mock).mockReturnValue({
      title: 'New task title',
      description: 'New task description',
    })
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '{"title":"New task title","description":"New task description"}' }],
    })

    await replaceTask(mockTaskId)

    expect(tasksInsertMock).toHaveBeenCalledWith({
      business_id: mockBusinessId,
      user_id: mockUserId,
      plan_id: null,
      channel_id: mockChannelId,
      title: 'New task title',
      description: 'New task description',
      scheduled_date: mockTask.scheduled_date,
    })
  })
})
