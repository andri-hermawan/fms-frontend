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
    gap={16}
    wrap
    style={{ marginBottom: 4, minWidth: 0, maxWidth: '100%' }}
  >
    {/* minWidth: 0 agar teks panjang tidak mendorong lebar dan memicu scroll horizontal */}
    <Flex vertical gap={2} style={{ minWidth: 0, flex: '1 1 auto' }}>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {subtitle && (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {subtitle}
        </Text>
      )}
    </Flex>

    {extra && (
      <Flex gap={8} wrap style={{ flexShrink: 1, minWidth: 0 }}>
        {extra}
      </Flex>
    )}
  </Flex>
)

export default PageHeader
