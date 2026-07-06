'use client'

import {
  useEffect,
  useState,
} from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Manager form for updating an existing employee's HR and account details.
export default function EditEmployeePage() {
  const router =
    useRouter()

  const params =
    useParams()

  const employeeId =
    params.id as string

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [formData, setFormData] =
    useState({
      first_name: '',
      last_name: '',
      email: '',
      telephone: '',
      role: 'employee',
      employment_type:
        'part-time',
      hourly_rate: '',
      contract_hours: '',
      holiday_allowance: '',
      status: 'active',
    })

  useEffect(() => {
    // Fetches the employee being edited and normalizes nullable database values for controlled inputs.
    const fetchEmployee =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from('employees')
          .select('*')
          .eq(
            'id',
            employeeId
          )
          .single()

        if (error) {
          console.error(
            error
          )
          alert(
            'Failed to load employee'
          )
          return
        }

        setFormData({
          first_name:
            data.first_name ||
            '',
          last_name:
            data.last_name ||
            '',
          email:
            data.email || '',
          telephone:
            data.telephone ||
            '',
          role:
            data.role ||
            'employee',
          employment_type:
            data.employment_type ||
            'part-time',
          hourly_rate:
            data.hourly_rate?.toString() ||
            '',
          status:
            data.status ||
            'active',
          contract_hours:
            data.contract_hours?.toString() ||
            '',
          holiday_allowance:
            data.holiday_allowance?.toString() ||
            '',
        })

        setLoading(false)
      }

    fetchEmployee()
  }, [employeeId])

  // Shared updater for all text, number, and select inputs in the edit form.
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    })
  }

  // Saves edited form data back to Supabase, converting numeric strings to numbers first.
  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault()

      setSaving(true)

      const { error } =
        await supabase.from('employees').update({...formData, hourly_rate: Number(formData.hourly_rate), contract_hours: Number(formData.contract_hours), holiday_allowance: Number(formData.holiday_allowance)}).eq('id', employeeId).select()

      if (error) {
        console.error(error)

        alert(
          'Failed to update employee'
        )
      } else {
        alert(
          'Employee updated successfully!'
        )

        router.push(
          '/admin/employees'
        )
      }

      setSaving(false)
    }

  if (loading) {
    return (
      <div className="mozo-card p-4 max-w-2xl">
        <p className="mozo-subtitle">Loading employee...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
      <h1 className="mozo-title mb-2">
        Edit Employee
      </h1>

      <p className="mozo-subtitle">
        Update employee details
      </p>
      </div>

      <form onSubmit={handleSubmit} className="mozo-card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <input name="first_name" value={formData.first_name} placeholder="First Name" className="mozo-input" onChange={handleChange} required />

          <input name="last_name" value={formData.last_name} placeholder="Last Name" className="mozo-input" onChange={handleChange} required />
        </div>

        <input name="email" type="email" value={formData.email} placeholder="Email" className="mozo-input" onChange={handleChange} required />

        <input name="telephone" value={formData.telephone} placeholder="Telephone" className="mozo-input" onChange={handleChange} />

        <select name="role" value={formData.role} className="mozo-select" onChange={handleChange} aria-label="Role">
          <option value="employee">
            Employee
          </option>

          <option value="manager">
            Manager
          </option>
        </select>

        <select name="employment_type" value={formData.employment_type} className="mozo-select" onChange={handleChange} aria-label="Employment Type">
          <option value="part-time">
            Part-Time
          </option>

          <option value="full-time">
            Full-Time
          </option>
        </select>

        <input name="hourly_rate" type="number" step="0.01" value={formData.hourly_rate} placeholder="Hourly Rate (£)" className="mozo-input" onChange={handleChange}/>

        <input name="contract_hours" type="number" value={formData.contract_hours} placeholder="Contract Hours" className="mozo-input" onChange={handleChange}/>

        <input name="holiday_allowance" type="number" value={formData.holiday_allowance} placeholder="Holiday Allowance" className="mozo-input" onChange={handleChange}/>
        
        <select name="status" value={formData.status} className="mozo-select" onChange={handleChange} aria-label="Status">
          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="mozo-btn mozo-btn-primary">
            {saving? 'Saving...': 'Save Changes'}
          </button>

          <button type="button" onClick={() => router.push('/admin/employees')}
            className="mozo-btn mozo-btn-outline">Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
