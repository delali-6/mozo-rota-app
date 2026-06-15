/// Create Route Guard Helper 
import { supabase } from './supabase'

export async function getCurrentUserRole() {
  const { data: { user }, } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: employee, } = await supabase.from('employees').select('role').eq('auth_user_id', user.id).maybeSingle()

  return employee?.role || null
}