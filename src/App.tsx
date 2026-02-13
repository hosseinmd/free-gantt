/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { IApi } from '@svar-ui/react-gantt'
import { Alert, message } from 'antd'
import type { UploadProps } from 'antd'
import Papa from 'papaparse'
import { useGoogleLogin } from '@react-oauth/google'
import { googleSheetsService } from './services/googleSheetsService'
import { Header } from './components/Header'
import { Controls } from './components/Controls'
import { EmptyState } from './components/EmptyState'
import { GanttChart } from './components/GanttChart'
import { GoogleSheetModal } from './components/GoogleSheetModal'
import { Footer } from './components/Footer'
import { CSVRow, GanttTask } from './types/gantt'
import './App.css'
import '@svar-ui/react-gantt/all.css'

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

  const handleAddTask = () => {
    setHasUnsavedChanges(true)
  }

  const handleUpdateTask = () => {
    setHasUnsavedChanges(true)
  }

  const handleDeleteTask = () => {
    setHasUnsavedChanges(true)
  }

  return (
    <div className="App">
      <Header connectedSheetId={connectedSheetId} />

      <Controls
        uploadProps={uploadProps}
        fileName={fileName}
        isSignedIn={isSignedIn}
        connectedSheetId={connectedSheetId}
        tasksLength={tasks.length}
        isLoading={isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onConnectSheet={handleConnectSheet}
        onSaveToSheet={handleSaveToSheet}
        onGoogleSignOut={handleGoogleSignOut}
        onGoogleSignIn={handleGoogleSignIn}
        onExportCSV={handleExportCSV}
        onClearData={handleClearData}
      />

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
        <GanttChart
          api={api}
          tasks={tasks}
          isLoading={isLoading}
          onInit={setApi}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <EmptyState
          uploadProps={uploadProps}
          isSignedIn={isSignedIn}
          isLoading={isLoading}
          onGoogleSignIn={handleGoogleSignIn}
          onConnectSheet={handleConnectSheet}
        />
      )}

      <GoogleSheetModal
        visible={sheetModalVisible}
        isLoading={isLoading}
        sheetUrl={sheetUrl}
        availableSheets={availableSheets}
        selectedSheet={selectedSheet}
        onSheetUrlChange={setSheetUrl}
        onSelectedSheetChange={setSelectedSheet}
        onFetchSheets={handleFetchSheets}
        onLoadSheet={handleLoadSheet}
        onCancel={() => {
          setSheetModalVisible(false)
          setAvailableSheets([])
          setSelectedSheet('')
        }}
        onBack={() => {
          setAvailableSheets([])
          setSelectedSheet('')
        }}
      />

      <Footer />
    </div>
  )
}

export default App
