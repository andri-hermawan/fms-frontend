export interface Attribute {
	id: string
	type: string | null
	geometry_type: string | null
	category: string | null
	segment: string | null
	buff_dist: number | null
	orig_fid: number | null
	code: string | null
	code_2: string | null
	hex_line: string | null
	hex_fill: string | null
	value1: number | null
	value2: number | null
	status: string | null
	project_id: string | null
	created_at: string
	created_by: string | null
	updated_at: string | null
	updated_by: string | null
}

export interface AttributeFormValues {
	type?: string | null
	geometry_type?: string | null
	category?: string | null
	segment?: string | null
	buff_dist?: number | null
	orig_fid?: number | null
	code?: string | null
	code_2?: string | null
	hex_line?: string | null
	hex_fill?: string | null
	value1?: number | null
	value2?: number | null
	status?: string | null
	project_id?: string | null
}