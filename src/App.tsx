import { useState } from 'react'
import { Editor, Gantt, IApi, Toolbar, Tooltip } from '@svar-ui/react-gantt'
import {
  Upload,
  Button,
  Card,
  Alert,
  Space,
  Typography,
  Divider,
  List,
  Tag,
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ExportOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import Papa from 'papaparse'
import './App.css'
import '@svar-ui/react-gantt/all.css'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

interface CSVRow {
  id: string
  text: string
  start: string
  end: string
  duration: string
  progress: string
  parent?: string
  type?: string
}

interface GanttTask {
  id: number | string
  text: string
  start: Date
  end: Date | undefined
  duration: number
  progress: number
  parent?: number | string
  type?: string
}

function App() {
  const [api, setApi] = useState<IApi | undefined>(undefined)
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [error, setError] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  const handleFileUpload = (file: File) => {
    setFileName(file.name)
    setError('')

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        try {
          const parsedTasks: GanttTask[] = results.data.map(row => {
            const task: GanttTask = {
              id: row.id,
              text: row.text,
              start: new Date(row.start),
              end: row.end ? new Date(row.end) : undefined,
              duration: parseInt(row.duration),
              progress: parseFloat(row.progress),
              type: row.type || 'task', // Default to 'task' if not specified
            }

            if (row.parent) {
              task.parent = row.parent
            }

            return task
          })

          setTasks(parsedTasks)
          setError('')
        } catch (err) {
          setError('Error parsing CSV file. Please check the format.')
          console.error(err)
        }
      },
      error: err => {
        setError('Error reading CSV file: ' + err.message)
        console.error(err)
      },
    })

    return false // Prevent upload
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    beforeUpload: handleFileUpload,
    showUploadList: false,
  }

  const handleClearData = () => {
    setTasks([])
    setFileName('')
    setError('')
  }

  const handleExportCSV = () => {
    if (!api || tasks.length === 0) return

    // Get current tasks from the Gantt API
    const currentTasks = api.getState()._tasks
    console.log(currentTasks)
    // Convert tasks to CSV-friendly format
    const csvData = currentTasks.map(task => ({
      id: task.id,
      text: task.text,
      start:
        task.start instanceof Date
          ? task.start.toISOString().split('T')[0]
          : task.start,
      end:
        task.end instanceof Date
          ? task.end.toISOString().split('T')[0]
          : task.end,
      duration: task.duration,
      progress: task.progress,
      parent: task.parent || '',
      type: task.type || 'task',
    }))

    // Use PapaParse to convert to CSV
    const csv = Papa.unparse(csvData, {
      columns: [
        'id',
        'text',
        'start',
        'end',
        'duration',
        'progress',
        'parent',
        'type',
      ],
    })

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `gantt-export-${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const csvFormatData = [
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

  const handleAddTask = (task: any) => {
    console.log('Adding task:', task)
  }

  const handleUpdateTask = (ev: any) => {
    console.log('Task updated:', ev)
  }

  const handleDeleteTask = (ev: any) => {
    console.log('Task deleted:', ev)
  }

  return (
    <div className="App">
      <header className="header">
        <ProjectOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
        <Title level={1} style={{ color: 'white', margin: 0 }}>
          Free Gantt Chart
        </Title>
        <Paragraph
          style={{
            color: 'white',
            opacity: 0.95,
            fontSize: '1.1rem',
            margin: '0.5rem 0 0 0',
          }}
        >
          Upload a CSV file to visualize your project timeline
        </Paragraph>
      </header>

      <div className="controls">
        <Space
          size="large"
          wrap
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Space wrap>
            <Dragger
              {...uploadProps}
              style={{ padding: '10px 20px', height: 'auto' }}
            >
              <Space>
                <UploadOutlined style={{ fontSize: '20px' }} />
                <Text strong>Click or drag CSV file to upload</Text>
              </Space>
            </Dragger>
            {fileName && (
              <Tag
                icon={<FileTextOutlined />}
                color="blue"
                style={{ fontSize: '14px', padding: '8px 12px' }}
              >
                {fileName}
              </Tag>
            )}
          </Space>

          <Space wrap>
            <a
              href={`${import.meta.env.BASE_URL}sample-gantt.csv`}
              download="sample-gantt.csv"
            >
              <Button icon={<DownloadOutlined />} size="large">
                Download Sample
              </Button>
            </a>
            {tasks.length > 0 && (
              <>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExportCSV}
                  type="primary"
                  size="large"
                >
                  Export to CSV
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleClearData}
                  danger
                  size="large"
                >
                  Clear Data
                </Button>
              </>
            )}
          </Space>
        </Space>
      </div>

      {error && (
        <div style={{ padding: '0 2rem' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
          />
        </div>
      )}

      {tasks.length > 0 ? (
        <div className="gantt-container wx-willow-dark-theme">
          <Toolbar api={api} />
          <Tooltip api={api}>
            <Gantt
              init={setApi}
              tasks={tasks}
              links={[]}
              scales={[
                { unit: 'month', step: 1, format: 'MMMM yyyy' },
                { unit: 'day', step: 1, format: 'd' },
              ]}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              readonly={false}
            />
          </Tooltip>
          {api && <Editor api={api} />}
        </div>
      ) : (
        <div className="empty-state">
          <Card
            style={{
              maxWidth: 800,
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{ fontSize: '5rem', opacity: 0.5, marginBottom: '1rem' }}
            >
              <DatabaseOutlined />
            </div>
            <Title level={2}>No data loaded</Title>
            <Paragraph style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Upload a CSV file or download the sample to get started
            </Paragraph>

            <Divider />

            <Title level={4} style={{ textAlign: 'left', color: '#667eea' }}>
              CSV Format Requirements:
            </Title>
            <List
              size="small"
              dataSource={csvFormatData}
              renderItem={item => (
                <List.Item style={{ textAlign: 'left', padding: '8px 0' }}>
                  <Space>
                    <Tag color={item.required ? 'red' : 'default'}>
                      {item.required ? 'Required' : 'Optional'}
                    </Tag>
                    <Text strong>{item.field}:</Text>
                    <Text type="secondary">{item.description}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </div>
      )}
    </div>
  )
}

export default App
