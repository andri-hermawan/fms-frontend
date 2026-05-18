import { Drawer, Button, Flex, Spin } from 'antd'
import type { ReactNode } from 'react'

// Map width angka ke size Ant Design
// default = 378px, large = 736px
// Untuk custom width, tetap pakai styles
type DrawerSize = 'default' | 'large'

interface FormDrawerProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  isSubmitting?: boolean
  isLoading?: boolean
  /** 'default' ~480px | 'large' ~720px | number untuk custom px */
  width?: DrawerSize | number
  children: ReactNode
  submitText?: string
}

const FormDrawer = ({
  open,
  title,
  onClose,
  onSubmit,
  isSubmitting = false,
  isLoading = false,
  width = 'default',
  children,
  submitText = 'Simpan',
}: FormDrawerProps) => {
  // Ant Design 5.x: pakai size untuk preset, styles.wrapper untuk custom
  const isPreset = width === 'default' || width === 'large'

  return (
    <Drawer
      open={open}
      title={title}
      size={isPreset ? width : 'default'}
      styles={
        !isPreset
          ? { wrapper: { width: typeof width === 'number' ? `${width}px` : width } }
          : undefined
      }
      onClose={onClose}
      maskClosable={!isSubmitting}
      closable={!isSubmitting}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="primary"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            {submitText}
          </Button>
        </Flex>
      }
    >
      <Spin spinning={isLoading}>
        {children}
      </Spin>
    </Drawer>
  )
}

export default FormDrawer
