import { supabase } from './supabase'

// Looks up the signed-in user's employee role so route guards can send managers and employees to the right portal.
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

// Returns the full employee record linked to the current Supabase auth user.
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
    .maybeSingle()

  if (error) {
    console.error(error)
    return null
  }

  return employee
}

