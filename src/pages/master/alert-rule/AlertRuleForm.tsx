import { useEffect } from 'react'
import { Form, Input, InputNumber, Radio, Select, Row, Col, Typography } from 'antd'
import type { AlertRule, AlertRuleFormValues, AlertRuleScope } from '@/types/alert-rule.types'
import { useAlertCategories } from '../alert-category/useAlertCategory'
import { useProjects } from '../project/useProject'
import { useAlertRuleSegments } from './useAlertRule'
import { getThresholdFields, SCOPE_OPTIONS, STATUS_OPTIONS, THRESHOLD_FIELDS } from './alertRule.constants'

interface Props {
  form: ReturnType<typeof Form.useForm<AlertRuleFormValues>>[0]
  initialValues?: AlertRule | null
}

const toNumber = (value: string | number | null) => (value === null ? null : Number(value))

const scopeOf = (rule: AlertRule): AlertRuleScope =>
  !rule.project_id ? 'global' : rule.segment ? 'segment' : 'project'

const AlertRuleForm = ({ form, initialValues }: Props) => {
  const categoryId = Form.useWatch('alert_category_id', form)
  const scope      = Form.useWatch('scope', form)
  const projectId  = Form.useWatch('project_id', form)

  const { data: categoryData, isLoading: loadingCategory } = useAlertCategories({ limit: 999999 })
  const { data: projectData, isLoading: loadingProject }   = useProjects({ limit: 999999 })
  const { data: segmentData, isFetching: loadingSegment }  =
    useAlertRuleSegments(scope === 'segment' ? projectId : null)

  const categories = categoryData?.data ?? []
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.alert_category_code} - ${c.alert_category_name}`,
  }))
  const projectOptions = (projectData?.data ?? []).map((p) => ({
    value: p.id,
    label: p.project_name,
  }))
  const segmentOptions = (segmentData ?? []).map((s) => ({
    value: s.segment,
    label: s.category ? `${s.segment} (${s.category})` : s.segment,
  }))

  const categoryCode = categories.find((c) => c.id === categoryId)?.alert_category_code
  const thresholdFields = getThresholdFields(categoryCode)

  useEffect(() => {
    if (!initialValues) {
      form.resetFields()
      return
    }
    form.setFieldsValue({
      alert_category_id: initialValues.alert_category_id,
      scope:             scopeOf(initialValues),
      project_id:        initialValues.project_id,
      segment:           initialValues.segment,
      duration_minutes:  toNumber(initialValues.duration_minutes),
      speed_limit:       toNumber(initialValues.speed_limit),
      fuel_threshold:    toNumber(initialValues.fuel_threshold),
      description:       initialValues.description ?? undefined,
      status:            initialValues.status,
    })
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}
      initialValues={{ scope: 'global', status: 'active' }}>
      <Form.Item name="alert_category_id" label="Alert Category"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select
          placeholder="Pilih alert category"
          loading={loadingCategory}
          options={categoryOptions}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item name="scope" label="Scope">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          options={SCOPE_OPTIONS}
          onChange={(e) => {
            if (e.target.value === 'global') form.setFieldsValue({ project_id: null, segment: null })
            if (e.target.value === 'project') form.setFieldValue('segment', null)
          }}
        />
      </Form.Item>

      {scope !== 'global' && (
        <Form.Item name="project_id" label="Project"
          rules={[{ required: true, message: 'Wajib dipilih' }]}>
          <Select
            placeholder="Pilih project"
            loading={loadingProject}
            options={projectOptions}
            showSearch
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={() => form.setFieldValue('segment', null)}
          />
        </Form.Item>
      )}

      {scope === 'segment' && (
        <Form.Item name="segment" label="Segment"
          rules={[{ required: true, message: 'Wajib dipilih' }]}>
          <Select
            placeholder={projectId ? 'Pilih segment' : 'Pilih project terlebih dahulu'}
            disabled={!projectId}
            loading={loadingSegment}
            options={segmentOptions}
            showSearch
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      )}

      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
        Kosongkan threshold untuk mengikuti nilai level di atasnya (default → global → project → segment).
      </Typography.Text>

      <Row gutter={12}>
        {thresholdFields.map((field) => (
          <Col span={12} key={field}>
            <Form.Item name={field} label={`${THRESHOLD_FIELDS[field].label} (${THRESHOLD_FIELDS[field].unit})`}>
              <InputNumber
                style={{ width: '100%' }}
                min={field === 'fuel_threshold' ? undefined : 0}
                step={field === 'duration_minutes' ? 0.5 : 1}
                placeholder="Ikuti default"
              />
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} maxLength={255} placeholder="Keterangan rule" />
      </Form.Item>

      <Form.Item name="status" label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
    </Form>
  )
}
export default AlertRuleForm
