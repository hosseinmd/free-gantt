import { Button, Space, Tag, Typography } from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ExportOutlined,
  GoogleOutlined,
  SaveOutlined,
  LoginOutlined,
  LogoutOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Upload } from 'antd'

const { Dragger } = Upload
const { Text } = Typography

interface ControlsProps {
  uploadProps: UploadProps
  fileName: string
  isSignedIn: boolean
  connectedSheetId: string | null
  tasksLength: number
  isLoading: boolean
  hasUnsavedChanges: boolean
  onConnectSheet: () => void
  onSaveToSheet: () => void
  onGoogleSignOut: () => void
  onGoogleSignIn: () => void
  onExportCSV: () => void
  onClearData: () => void
}

export const Controls = ({
  uploadProps,
  fileName,
  isSignedIn,
  connectedSheetId,
  tasksLength,
  isLoading,
  hasUnsavedChanges,
  onConnectSheet,
  onSaveToSheet,
  onGoogleSignOut,
  onGoogleSignIn,
  onExportCSV,
  onClearData,
}: ControlsProps) => {
  return (
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
                  <UploadOutlined
                    style={{ fontSize: '20px', color: 'white' }}
                  />
                  <Text strong style={{ color: 'white' }}>
                    Click or drag CSV file to upload
                  </Text>
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
                onClick={onConnectSheet}
                size="large"
                type={connectedSheetId ? 'default' : 'primary'}
              >
                {connectedSheetId ? 'Change Sheet' : 'Connect Sheet'}
              </Button>
              {connectedSheetId && tasksLength > 0 && (
                <Button
                  icon={<SaveOutlined />}
                  onClick={onSaveToSheet}
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
                onClick={onGoogleSignOut}
                size="large"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              icon={<LoginOutlined />}
              onClick={onGoogleSignIn}
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

          {tasksLength > 0 && (
            <>
              <Button
                icon={<ExportOutlined />}
                onClick={onExportCSV}
                type={connectedSheetId ? 'default' : 'primary'}
                size="large"
              >
                Export to CSV
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={onClearData}
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
  )
}
