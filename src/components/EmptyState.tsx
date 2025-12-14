import { Button, Card, Space, Typography, Divider, List, Tag, Tabs } from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  GoogleOutlined,
  LoginOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Upload } from 'antd'
import { csvFormatData } from '../constants/csvFormat'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

interface EmptyStateProps {
  uploadProps: UploadProps
  isSignedIn: boolean
  isLoading: boolean
  onGoogleSignIn: () => void
  onConnectSheet: () => void
}

export const EmptyState = ({
  uploadProps,
  isSignedIn,
  isLoading,
  onGoogleSignIn,
  onConnectSheet,
}: EmptyStateProps) => {
  return (
    <div className="empty-state">
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
                        onClick={onGoogleSignIn}
                        loading={isLoading}
                      >
                        Sign in with Google
                      </Button>
                    </Space>
                  ) : (
                    <Space direction="vertical" size="large">
                      <Paragraph type="success">
                        ✓ Signed in to Google
                      </Paragraph>
                      <Button
                        type="primary"
                        size="large"
                        icon={<LinkOutlined />}
                        onClick={onConnectSheet}
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
    </div>
  )
}
