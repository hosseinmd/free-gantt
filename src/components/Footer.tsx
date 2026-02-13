import { Typography } from 'antd'

const { Text, Link } = Typography

export const Footer = () => {
  return (
    <footer className="footer">
      <Text type="secondary">
        <Link
          href={`${import.meta.env.BASE_URL}privacy-policy.html`}
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </Link>
        {' · '}
        <Link
          href={`${import.meta.env.BASE_URL}terms-of-service.html`}
          target="_blank"
          rel="noreferrer"
        >
          Terms
        </Link>
        {' · '}
        <Link
          href="https://github.com/hosseinmd/free-gantt"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Repo
        </Link>
      </Text>
    </footer>
  )
}

