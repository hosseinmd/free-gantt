export const csvFormatData = [
  {
    field: 'id',
    required: true,
    description: 'Unique identifier for each task',
  },
  { field: 'text', required: true, description: 'Task name/description' },
  {
    field: 'start',
    required: true,
    description: 'Start date (YYYY-MM-DD format)',
  },
  {
    field: 'end',
    required: true,
    description: 'End date (YYYY-MM-DD format)',
  },
  { field: 'duration', required: true, description: 'Task duration in days' },
  {
    field: 'progress',
    required: true,
    description: 'Completion progress (0-1)',
  },
  {
    field: 'parent',
    required: false,
    description: 'Parent task ID (optional)',
  },
  {
    field: 'type',
    required: false,
    description: 'Task type (optional: task/project/milestone)',
  },
]
