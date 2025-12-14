import { Modal, Space, Typography, Input, Alert, Select, Button } from 'antd'
import { LinkOutlined } from '@ant-design/icons'

const { Paragraph } = Typography

interface GoogleSheetModalProps {
  visible: boolean
  isLoading: boolean
  sheetUrl: string
  availableSheets: string[]
  selectedSheet: string
  onSheetUrlChange: (url: string) => void
  onSelectedSheetChange: (sheet: string) => void
  onFetchSheets: () => void
  onLoadSheet: () => void
  onCancel: () => void
  onBack: () => void
}

export const GoogleSheetModal = ({
  visible,
  isLoading,
  sheetUrl,
  availableSheets,
  selectedSheet,
  onSheetUrlChange,
  onSelectedSheetChange,
  onFetchSheets,
  onLoadSheet,
  onCancel,
  onBack,
}: GoogleSheetModalProps) => {
  return (
    <Modal
      title="Connect Google Sheet"
      open={visible}
      onOk={onLoadSheet}
      onCancel={onCancel}
      okText={availableSheets.length > 0 ? 'Load Sheet' : 'Next'}
      okButtonProps={{
        disabled: availableSheets.length > 0 && !selectedSheet,
      }}
      confirmLoading={isLoading}
      width={600}
      footer={
        availableSheets.length === 0
          ? [
              <Button key="back" onClick={onCancel}>
                Cancel
              </Button>,
              <Button
                key="next"
                type="primary"
                loading={isLoading}
                onClick={onFetchSheets}
              >
                Next
              </Button>,
            ]
          : [
              <Button key="back" onClick={onBack} disabled={isLoading}>
                Back
              </Button>,
              <Button
                key="load"
                type="primary"
                loading={isLoading}
                disabled={!selectedSheet}
                onClick={onLoadSheet}
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
                onChange={e => onSheetUrlChange(e.target.value)}
                size="large"
                prefix={<LinkOutlined />}
                onPressEnter={onFetchSheets}
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
                onChange={onSelectedSheetChange}
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
  )
}
