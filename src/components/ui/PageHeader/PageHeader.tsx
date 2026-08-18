import { Typography, Flex } from 'antd'
import type { ReactNode } from 'react'

const { Title, Text } = Typography

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  extra?: ReactNode
}

const PageHeader = ({ title, subtitle, extra }: PageHeaderProps) => (
  <Flex
    align="flex-start"
    justify="space-between"
    style={{ marginBottom: 4 }}
  >
    <Flex vertical gap={2}>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {subtitle && (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {subtitle}
        </Text>
      )}
    </Flex>

    {extra && <Flex gap={8}>{extra}</Flex>}
  </Flex>
)

export default PageHeader
