import { Editor, Gantt, IApi, Toolbar, Tooltip } from '@svar-ui/react-gantt'
import { Spin } from 'antd'
import { GanttTask } from '../types/gantt'

interface GanttChartProps {
  api: IApi | undefined
  tasks: GanttTask[]
  isLoading: boolean
  onInit: (api: IApi) => void
  onAddTask: () => void
  onUpdateTask: () => void
  onDeleteTask: () => void
}

export const GanttChart = ({
  api,
  tasks,
  isLoading,
  onInit,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: GanttChartProps) => {
  return (
    <Spin spinning={isLoading}>
      <div className="gantt-container wx-willow-dark-theme">
        <Toolbar api={api} />
        <Tooltip api={api}>
          <Gantt
            init={onInit}
            tasks={tasks}
            links={[]}
            scales={[
              { unit: 'month', step: 1, format: 'MMMM yyyy' },
              { unit: 'day', step: 1, format: 'd' },
            ]}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            readonly={false}
          />
        </Tooltip>
        {api && <Editor api={api} />}
      </div>
    </Spin>
  )
}
