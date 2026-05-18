import React from 'react'
import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface ConfirmOptions {
  title?: string
  content?: string
  okText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  danger?: boolean
}

/**
 * Utility function — bukan component.
 * Pakai: showConfirm({ content: 'Yakin hapus?', onConfirm: handleDelete })
 */
export const showConfirm = ({
  title = 'Konfirmasi',
  content = 'Apakah kamu yakin?',
  okText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  danger = false,
}: ConfirmOptions) => {
  Modal.confirm({
    title,
    icon: React.createElement(ExclamationCircleOutlined),
    content,
    okText,
    cancelText,
    okButtonProps: { danger },
    onOk: onConfirm,
    centered: true,
  })
}

export default showConfirm
