import { useState, useEffect } from 'react'
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
  Input,
  Modal,
  Spin,
  message,
  Tabs,
  Select,
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ExportOutlined,
  DatabaseOutlined,
  GoogleOutlined,
  SaveOutlined,
  LoginOutlined,
  LogoutOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import Papa from 'papaparse'
import { useGoogleLogin } from '@react-oauth/google'
import { googleSheetsService } from './services/googleSheetsService'
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

  // Google Sheets states
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [connectedSheetId, setConnectedSheetId] = useState<string | null>(null)
  const [connectedSheetName, setConnectedSheetName] = useState<string | null>(
    null
  )
  const [sheetModalVisible, setSheetModalVisible] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')

  // Check for saved session on mount
  useEffect(() => {
    const hasSession = googleSheetsService.hasAccessToken()
    if (hasSession) {
      setIsSignedIn(true)
    }
  }, [])

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Login successful:', tokenResponse)
      // Store token with expiration time (default 3600 seconds if not provided)
      const expiresIn = tokenResponse.expires_in || 3600
      googleSheetsService.setAccessToken(tokenResponse.access_token, expiresIn)
      setIsSignedIn(true)
      message.success('Successfully signed in to Google!')
    },
    onError: error => {
      console.error('Login failed:', error)
      message.error('Failed to sign in to Google')
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  })

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    try {
      login()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignOut = () => {
    googleSheetsService.clearAccessToken()
    setIsSignedIn(false)
    setConnectedSheetId(null)
    setConnectedSheetName(null)
    setTasks([])
    message.success('Signed out successfully')
  }

  const handleConnectSheet = () => {
    if (!isSignedIn) {
      message.warning('Please sign in to Google first')
      return
    }
    setSheetUrl('')
    setAvailableSheets([])
    setSelectedSheet('')
    setSheetModalVisible(true)
  }

  const handleFetchSheets = async () => {
    if (!sheetUrl.trim()) {
      message.error('Please enter a Google Sheets URL')
      return
    }

    const spreadsheetId = googleSheetsService.extractSheetId(sheetUrl)
    if (!spreadsheetId) {
      message.error('Invalid Google Sheets URL')
      return
    }

    setIsLoading(true)

    try {
      const sheets = await googleSheetsService.getAllSheetNames(spreadsheetId)
      setAvailableSheets(sheets)
      setSelectedSheet(sheets[0]) // Select first sheet by default

      if (sheets.length === 1) {
        message.success(`Found 1 sheet: "${sheets[0]}"`)
      } else {
        message.success(`Found ${sheets.length} sheets. Please select one.`)
      }
    } catch (error: any) {
      console.error('Error fetching sheets:', error)
      message.error(error?.message || 'Failed to fetch sheet names')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadSheet = async () => {
    if (!selectedSheet) {
      message.error('Please select a sheet')
      return
    }

    const spreadsheetId = googleSheetsService.extractSheetId(sheetUrl)
    if (!spreadsheetId) {
      message.error('Invalid Google Sheets URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await googleSheetsService.readSheet(
        spreadsheetId,
        selectedSheet
      )
      const parsedData = googleSheetsService.parseSheetData(data)

      const parsedTasks: GanttTask[] = parsedData.map((row: CSVRow) => {
        const task: GanttTask = {
          id: row.id,
          text: row.text,
          start: new Date(row.start),
          end: row.end ? new Date(row.end) : undefined,
          duration: parseInt(row.duration),
          progress: parseFloat(row.progress),
          type: row.type || 'task',
        }

        if (row.parent) {
          task.parent = row.parent
        }

        return task
      })

      setTasks(parsedTasks)
      setConnectedSheetId(spreadsheetId)
      setConnectedSheetName(selectedSheet)
      setSheetModalVisible(false)
      setHasUnsavedChanges(false)
      setAvailableSheets([])
      message.success(
        `Successfully loaded data from Google Sheets! (Sheet: "${selectedSheet}")`
      )
    } catch (error: any) {
      console.error('Error loading sheet:', error)
      const errorMessage =
        error?.message ||
        'Failed to load Google Sheet. Make sure you have access to this sheet.'
      setError(errorMessage)
      message.error('Failed to load Google Sheet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToSheet = async () => {
    if (!connectedSheetId || !api) {
      message.error('No sheet connected')
      return
    }

    setIsLoading(true)

    try {
      const currentTasks = api.getState()._tasks

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

      const sheetData = googleSheetsService.formatDataForSheet(csvData)
      // Use the stored sheet name, or get it if not available
      const sheetName =
        connectedSheetName ||
        (await googleSheetsService.getFirstSheetName(connectedSheetId))
      await googleSheetsService.writeSheet(
        connectedSheetId,
        sheetName,
        sheetData
      )

      setHasUnsavedChanges(false)
      message.success('Successfully saved changes to Google Sheets!')
    } catch (error) {
      console.error('Error saving to sheet:', error)
      message.error('Failed to save to Google Sheets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (file: File) => {
    setFileName(file.name)
    setError('')
    setConnectedSheetId(null)

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
              type: row.type || 'task',
            }

            if (row.parent) {
              task.parent = row.parent
            }

            return task
          })

          setTasks(parsedTasks)
          setError('')
          setHasUnsavedChanges(false)
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

    return false
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
    setConnectedSheetId(null)
    setConnectedSheetName(null)
    setHasUnsavedChanges(false)
  }

  const handleExportCSV = () => {
    if (!api || tasks.length === 0) return

    const currentTasks = api.getState()._tasks

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

  const handleAddTask = () => {
    setHasUnsavedChanges(true)
  }

  const handleUpdateTask = () => {
    setHasUnsavedChanges(true)
  }

  const handleDeleteTask = () => {
    setHasUnsavedChanges(true)
  }

  const emptyStateContent = (
    <Card
      style={{
        maxWidth: 900,
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ fontSize: '5rem', opacity: 0.5, marginBottom: '1rem' }}>
        <DatabaseOutlined />
      </div>
      <Title level={2}>No data loaded</Title>
      <Paragraph style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Connect to Google Sheets or upload a CSV file to get started
      </Paragraph>

      <Tabs
        defaultActiveKey="sheets"
        centered
        items={[
          {
            key: 'sheets',
            label: (
              <span>
                <GoogleOutlined /> Google Sheets
              </span>
            ),
            children: (
              <div style={{ padding: '20px 0' }}>
                {!isSignedIn ? (
                  <Space direction="vertical" size="large">
                    <Paragraph>
                      Sign in to Google to connect your Gantt chart data
                    </Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      icon={<LoginOutlined />}
                      onClick={handleGoogleSignIn}
                      loading={isLoading}
                    >
                      Sign in with Google
                    </Button>
                  </Space>
                ) : (
                  <Space direction="vertical" size="large">
                    <Paragraph type="success">✓ Signed in to Google</Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      icon={<LinkOutlined />}
                      onClick={handleConnectSheet}
                    >
                      Connect Google Sheet
                    </Button>
                  </Space>
                )}
              </div>
            ),
          },
          {
            key: 'csv',
            label: (
              <span>
                <FileTextOutlined /> CSV File
              </span>
            ),
            children: (
              <div style={{ padding: '20px 0' }}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: '48px' }} />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag CSV file to this area to upload
                    </p>
                  </Dragger>
                  <a
                    href={`${import.meta.env.BASE_URL}sample-gantt.csv`}
                    download="sample-gantt.csv"
                  >
                    <Button icon={<DownloadOutlined />} size="large">
                      Download Sample CSV
                    </Button>
                  </a>
                </Space>
              </div>
            ),
          },
        ]}
      />

      <Divider />

      <Title level={4} style={{ textAlign: 'left', color: '#667eea' }}>
        Data Format Requirements:
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
  )

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
          {connectedSheetId
            ? 'Connected to Google Sheets'
            : 'Upload a CSV file or connect Google Sheets to visualize your project'}
        </Paragraph>
      </header>

      <div className="controls">
        <Space
          size="large"
          wrap
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Space wrap>
            {connectedSheetId ? (
              <Tag
                icon={<GoogleOutlined />}
                color="green"
                style={{ fontSize: '14px', padding: '8px 12px' }}
              >
                Google Sheets Connected
              </Tag>
            ) : (
              <>
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
              </>
            )}
          </Space>

          <Space wrap>
            {isSignedIn ? (
              <>
                <Button
                  icon={<LinkOutlined />}
                  onClick={handleConnectSheet}
                  size="large"
                  type={connectedSheetId ? 'default' : 'primary'}
                >
                  {connectedSheetId ? 'Change Sheet' : 'Connect Sheet'}
                </Button>
                {connectedSheetId && tasks.length > 0 && (
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSaveToSheet}
                    type="primary"
                    size="large"
                    loading={isLoading}
                    disabled={!hasUnsavedChanges}
                  >
                    Save to Sheet
                    {hasUnsavedChanges && ' *'}
                  </Button>
                )}
                <Button
                  icon={<LogoutOutlined />}
                  onClick={handleGoogleSignOut}
                  size="large"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                icon={<LoginOutlined />}
                onClick={handleGoogleSignIn}
                type="primary"
                size="large"
                loading={isLoading}
              >
                Sign in with Google
              </Button>
            )}

            {!connectedSheetId && (
              <a
                href={`${import.meta.env.BASE_URL}sample-gantt.csv`}
                download="sample-gantt.csv"
              >
                <Button icon={<DownloadOutlined />} size="large">
                  Download Sample
                </Button>
              </a>
            )}

            {tasks.length > 0 && (
              <>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExportCSV}
                  type={connectedSheetId ? 'default' : 'primary'}
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
            onClose={() => setError('')}
          />
        </div>
      )}

      {hasUnsavedChanges && connectedSheetId && (
        <div style={{ padding: '0 2rem' }}>
          <Alert
            message="You have unsaved changes"
            description="Remember to save your changes to Google Sheets"
            type="warning"
            showIcon
          />
        </div>
      )}

      {tasks.length > 0 ? (
        <Spin spinning={isLoading}>
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
        </Spin>
      ) : (
        <div className="empty-state">{emptyStateContent}</div>
      )}

      <Modal
        title="Connect Google Sheet"
        open={sheetModalVisible}
        onOk={handleLoadSheet}
        onCancel={() => {
          setSheetModalVisible(false)
          setAvailableSheets([])
          setSelectedSheet('')
        }}
        okText={availableSheets.length > 0 ? 'Load Sheet' : 'Next'}
        okButtonProps={{
          disabled: availableSheets.length > 0 && !selectedSheet,
        }}
        confirmLoading={isLoading}
        width={600}
        footer={
          availableSheets.length === 0
            ? [
                <Button
                  key="back"
                  onClick={() => {
                    setSheetModalVisible(false)
                    setAvailableSheets([])
                    setSelectedSheet('')
                  }}
                >
                  Cancel
                </Button>,
                <Button
                  key="next"
                  type="primary"
                  loading={isLoading}
                  onClick={handleFetchSheets}
                >
                  Next
                </Button>,
              ]
            : [
                <Button
                  key="back"
                  onClick={() => {
                    setAvailableSheets([])
                    setSelectedSheet('')
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>,
                <Button
                  key="load"
                  type="primary"
                  loading={isLoading}
                  disabled={!selectedSheet}
                  onClick={handleLoadSheet}
                >
                  Load Sheet
                </Button>,
              ]
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {availableSheets.length === 0 ? (
            <>
              <div>
                <Paragraph>
                  Enter the URL of your Google Sheet containing the Gantt chart
                  data:
                </Paragraph>
                <Input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  size="large"
                  prefix={<LinkOutlined />}
                  onPressEnter={handleFetchSheets}
                />
              </div>
              <Alert
                message="Sheet Format"
                description="Make sure your Google Sheet has the same columns as the CSV format: id, text, start, end, duration, progress, parent, type"
                type="info"
                showIcon
              />
            </>
          ) : (
            <>
              <Alert
                message={`Found ${availableSheets.length} sheet${availableSheets.length > 1 ? 's' : ''}`}
                description={
                  availableSheets.length > 1
                    ? 'Please select which sheet contains your Gantt chart data:'
                    : 'Ready to load your Gantt chart data'
                }
                type="success"
                showIcon
              />
              <div>
                <Paragraph strong>Select Sheet:</Paragraph>
                <Select
                  value={selectedSheet}
                  onChange={setSelectedSheet}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Choose a sheet"
                  options={availableSheets.map(sheet => ({
                    label: sheet,
                    value: sheet,
                  }))}
                />
              </div>
              <Alert
                message="Sheet Format"
                description="The selected sheet should have columns: id, text, start, end, duration, progress, parent, type"
                type="info"
                showIcon
              />
            </>
          )}
        </Space>
      </Modal>
    </div>
  )
}

export default App
