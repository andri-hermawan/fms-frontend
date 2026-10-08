import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useAlertRules, useCreateAlertRule, useUpdateAlertRule, useDeleteAlertRule } from './useAlertRule'
import { useAlertCategories } from '../alert-category/useAlertCategory'
import AlertRuleForm from './AlertRuleForm'
import AlertRuleFilter, { type AlertRuleFilterValues } from './AlertRuleFilter'
import { getThresholdFields } from './alertRule.constants'
import usePermission from '@/hooks/usePermission'
import { formatDate } from '@/utils/format'
import type {
  AlertRule,
  AlertRuleFormValues,
  AlertRulePayload,
  AlertRuleQueryParams,
  AlertRuleScope,
  AlertRuleThresholdField,
} from '@/types/alert-rule.types'

const SCOPE_TAG: Record<AlertRuleScope, { color: string; label: string }> = {
  global:  { color: 'blue',   label: 'Global' },
  project: { color: 'purple', label: 'Project' },
  segment: { color: 'orange', label: 'Segment' },
}

const scopeOf = (r: AlertRule): AlertRuleScope =>
  !r.project_id ? 'global' : r.segment ? 'segment' : 'project'

// null = mengikuti level di atasnya
const renderThreshold = (value: string | number | null, unit: string) =>
  value === null
    ? <span style={{ color: '#999' }}>Default</span>
    : `${Number(value)} ${unit}`

const AlertRuleListPage = () => {
  const [form] = Form.useForm<AlertRuleFormValues>()
  const [open, setOpen]             = useState(false)
  const [selected, setSelected]     = useState<AlertRule | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [params, setParams]         = useState<AlertRuleQueryParams>({ page: 1, limit: 25 })

  const { data, isLoading } = useAlertRules(params)
  const { data: categoryData } = useAlertCategories({ limit: 999999 })
  const createM = useCreateAlertRule()
  const updateM = useUpdateAlertRule()
  const deleteM = useDeleteAlertRule()

  const canCreate = usePermission('alert_rule', 'create')
  const canUpdate = usePermission('alert_rule', 'update')
  const canDelete = usePermission('alert_rule', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: AlertRule) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleApplyFilter = (values: AlertRuleFilterValues) => {
    setParams((prev) => ({ ...prev, ...values, page: 1 }))
    setFilterOpen(false)
  }

  const actionMenu: MenuProps['items'] = [
    ...(canCreate
      ? [{ key: 'add', icon: <PlusOutlined />, label: 'Add', onClick: openCreate }]
      : []),
  ]

  const handleSubmit = () => {
    form.validateFields().then(() => {
      // getFieldsValue(true) juga membawa field yang sedang tersembunyi
      const { scope, ...values } = form.getFieldsValue(true) as AlertRuleFormValues
      const code = categoryData?.data.find((c) => c.id === values.alert_category_id)?.alert_category_code
      const fields = getThresholdFields(code)
      // Threshold yang tidak dipakai kategori ini dikosongkan (ikut default)
      const threshold = (field: AlertRuleThresholdField) =>
        fields.includes(field) ? values[field] ?? null : null

      const payload: AlertRulePayload = {
        alert_category_id: values.alert_category_id,
        project_id:        scope === 'global' ? null : values.project_id ?? null,
        segment:           scope === 'segment' ? values.segment ?? null : null,
        duration_minutes:  threshold('duration_minutes'),
        speed_limit:       threshold('speed_limit'),
        fuel_threshold:    threshold('fuel_threshold'),
        description:       values.description?.trim() ?? '',
        status:            values.status,
      }

      if (isEdit) {
        updateM.mutate({ id: selected.id, payload }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(payload, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: AlertRule) => {
    const scopeLabel = r.projects
      ? `${r.projects.project_name}${r.segment ? ` / ${r.segment}` : ''}`
      : 'Global'
    showConfirm({
      title: 'Delete Alert Rule',
      content: `Yakin hapus rule "${r.alert_categories.alert_category_name}" (${scopeLabel})?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<AlertRule> = [
    {
      title: 'Alert Category',
      key: 'alert_category',
      width: 200,
      align: 'left',
      render: (_, r) => (
        <span>{r.alert_categories.alert_category_name}</span>
      ),
    },
    {
      title: 'Scope',
      key: 'scope',
      width: 100,
      align: 'center',
      render: (_, r) => {
        const tag = SCOPE_TAG[scopeOf(r)]
        return <Tag color={tag.color}>{tag.label}</Tag>
      },
    },
    {
      title: 'Project',
      key: 'project',
      width: 160,
      align: 'left',
      render: (_, r) => r.projects?.project_name ?? '-',
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      width: 120,
      align: 'left',
      render: (value) => value ?? '-',
    },
    {
      title: 'Duration',
      dataIndex: 'duration_minutes',
      width: 110,
      align: 'center',
      render: (value) => renderThreshold(value, 'menit'),
    },
    {
      title: 'Speed Limit',
      dataIndex: 'speed_limit',
      width: 110,
      align: 'center',
      render: (value) => renderThreshold(value, 'km/h'),
    },
    {
      title: 'Fuel Threshold',
      dataIndex: 'fuel_threshold',
      width: 120,
      align: 'center',
      render: (value) => renderThreshold(value, 'L'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
      align: 'left',
      ellipsis: true,
      render: (value) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (value) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Updated At',
      key: 'updated_at',
      width: 140,
      align: 'center',
      render: (_, r) => formatDate(r.updated_at ?? r.created_at),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {canUpdate && (
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(record)}
              />
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Hapus">
              <Button
                type="text"
                size="small"
                danger
                loading={deleteM.isPending}
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Alert Rule"
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>Filter</Button>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
              <Button type="primary">Actions <DownOutlined /></Button>
            </Dropdown>
          </Space>
        }
      />
      <DataTable<AlertRule>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable={false}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => setParams((prev) => ({ ...prev, page: s !== prev.limit ? 1 : p, limit: s })), showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <AlertRuleFilter
        open={filterOpen}
        initialValues={{ alert_category_id: params.alert_category_id, project_id: params.project_id, status: params.status }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Alert Rule' : 'Add Alert Rule'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Save' : 'Add'}>
        <AlertRuleForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default AlertRuleListPage
