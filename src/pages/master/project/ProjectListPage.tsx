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
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from './useProject'
import ProjectForm from './ProjectForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { Project, ProjectFormValues } from '@/types/project.types'

const ProjectListPage = () => {
  const [form] = Form.useForm<ProjectFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading } = useProjects(params)
  const createM = useCreateProject()
  const updateM = useUpdateProject()
  const deleteM = useDeleteProject()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: Project) => { setSelected(r); setOpen(true) }
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

  const handleDelete = (r: Project) => {
    showConfirm({
      title: 'Delete Project',
      content: `Yakin delete project "${r.project_name}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<Project> = [
    {
      title: 'Company',
      key: 'companies',
      width: 180,
      align: 'left',
      render: (_, record) =>
        record.companies?.company_name ?? '—',
    },
    {
      title: 'Project Code',
      dataIndex: 'project_code',
      width: 120,
      align: 'left',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      title: 'Project Name',
      dataIndex: 'project_name',
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
        title="Project"
        // subtitle={`Total ${data?.meta?.total ?? 0} project`}
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>Filter</Button>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
              <Button type="primary">Actions <DownOutlined /></Button>
            </Dropdown>
          </Space>
        }
      />
      <DataTable<Project>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable={false}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <ReportFilter
        open={filterOpen}
        title="Project ? Filter"
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
      <FormDrawer open={open} title={isEdit ? 'Edit Project' : 'Add Project'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <ProjectForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default ProjectListPage
