import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from './useCompany'
import CompanyForm from './CompanyForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { Company, CompanyFormValues } from '@/types/company.types'

const CompanyListPage = () => {
  const [form] = Form.useForm<CompanyFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Company | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading } = useCompanies(params)
  const createM = useCreateCompany()
  const updateM = useUpdateCompany()
  const deleteM = useDeleteCompany()

  const canCreate = usePermission('company', 'create')
  const canUpdate = usePermission('company', 'update')
  const canDelete = usePermission('company', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit   = (r: Company) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }



  const handleApplyFilter = (values: ReportFilterValues) => {
    setSearch(values.search ?? '')
    setFilterOpen(false)
  }

  const actionMenu: MenuProps['items'] = [
    ...(canCreate
      ? [{ key: 'add', icon: <PlusOutlined />, label: 'Add', onClick: openCreate }]
      : []),
  ]

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload: values }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: Company) => {
    showConfirm({
      title: 'Delete Company',
      content: `Yakin delete company "${r.company_name}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<Company> = [
    {
      title: 'Company Code',
      dataIndex: 'company_code',
      width: 120,
      align: 'left',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      width: 220,
      align: 'left',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Aktif' : 'Nonaktif'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      width: 140,
      align: 'center',
      render: (value) => formatDate(value),
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
        title="Company"
        // subtitle={`Total ${data?.meta?.total ?? 0} company`}
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>Filter</Button>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
              <Button type="primary">Actions <DownOutlined /></Button>
            </Dropdown>
          </Space>
        }
      />
      <DataTable<Company>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable={false}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <ReportFilter
        open={filterOpen}
        title="Company ? Filter"
        dateMode="none"
        showSearch
        searchPlaceholder="Cari kode atau nama..."
        showEquipment={false}
        showShift={false}
        initialValues={{ search: params.search }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Company' : 'Add Company'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Save' : 'Add'}>
        <CompanyForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default CompanyListPage
