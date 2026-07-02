/// Create Route Guard Helper 
import { supabase } from './supabase'

export async function getCurrentUserRole() {
  const { data: { user }, } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: employee, error } = await supabase.from('employees').select('role').eq('auth_user_id', user.id).maybeSingle()

  if (error) {
    console.error('Error fetching employee role:', error)
    return null
  }

  return employee?.role || null
}

export async function getCurrentEmployee() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return employee
}

