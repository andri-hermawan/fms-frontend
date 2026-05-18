import { useAuthStore } from '@/stores/auth.store'
import { PERMISSION_MAP } from '@/types/auth.types'
import type { Action, Resource } from '@/types/auth.types'

/**
 * Cek apakah user saat ini punya akses ke resource + action tertentu.
 *
 * Contoh:
 *   const canCreate = usePermission('vehicle', 'create')
 *   const canDelete = usePermission('user', 'delete')
 */
const usePermission = (resource: Resource, action: Action): boolean => {
  const role = useAuthStore((s) => s.user?.role)

  if (!role) return false

  const allowedActions = PERMISSION_MAP[role]?.[resource] ?? []
  return allowedActions.includes(action)
}

export default usePermission
