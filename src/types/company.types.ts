export type CompanyStatus = 'active' | 'inactive'

export interface Company {
  id: string
  company_code: string
  company_name: string
  status: CompanyStatus
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface CompanyFormValues {
  company_code: string
  company_name: string
  status: CompanyStatus
}