import { Typography } from 'antd'
import { ProjectOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface HeaderProps {
  connectedSheetId: string | null
}

export const Header = ({ connectedSheetId }: HeaderProps) => {
  return (
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
  )
}
