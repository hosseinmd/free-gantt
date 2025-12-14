export interface CSVRow {
  id: string
  text: string
  start: string
  end: string
  duration: string
  progress: string
  parent?: string
  type?: string
}

export interface GanttTask {
  id: number | string
  text: string
  start: Date
  end: Date | undefined
  duration: number
  progress: number
  parent?: number | string
  type?: string
}
