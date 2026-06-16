'use client'

import {
  useEffect,
  useState,
} from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditEmployeePage() {
  const router =
    useRouter()

  const params =
    useParams()

  const employeeId =
    params.id as string
    console.log('Employee ID:', employeeId)

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
      status: 'active',
    })

  useEffect(() => {
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

          console.log('Fetched employee:', data)
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
        })

        setLoading(false)
      }

    fetchEmployee()
  }, [employeeId])

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

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault()

      setSaving(true)

      console.log('Updating employee:',employeeId)

      const { data, error } =
        await supabase.from('employees').update({...formData, hourly_rate: Number(formData.hourly_rate),}).eq('id', employeeId).select()
        console.log('Updated employee:', data)
        console.log('Error updating employee:', error)

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
      <p>
        Loading employee...
      </p>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">
        Edit Employee
      </h1>

      <p className="text-gray-500 mb-8">
        Update employee details
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <input name="first_name" value={formData.first_name} placeholder="First Name" className="border rounded-lg p-3" onChange={handleChange} required />

          <input name="last_name" value={formData.last_name} placeholder="Last Name" className="border rounded-lg p-3" onChange={handleChange} required />
        </div>

        <input name="email" type="email" value={formData.email} placeholder="Email" className="w-full border rounded-lg p-3" onChange={handleChange} required />

        <input name="telephone" value={formData.telephone} placeholder="Telephone" className="w-full border rounded-lg p-3" onChange={handleChange} />

        <select name="role" value={formData.role} className="w-full border rounded-lg p-3" onChange={handleChange} aria-label="Role">
          <option value="employee">
            Employee
          </option>

          <option value="manager">
            Manager
          </option>
        </select>

        <select name="employment_type" value={formData.employment_type} className="w-full border rounded-lg p-3" onChange={handleChange} aria-label="Employment Type">
          <option value="part-time">
            Part-Time
          </option>

          <option value="full-time">
            Full-Time
          </option>
        </select>

        <input name="hourly_rate" type="number" step="0.01" value={formData.hourly_rate} placeholder="Hourly Rate (£)" className="w-full border rounded-lg p-3" onChange={handleChange}/>

        <select name="status" value={formData.status} className="w-full border rounded-lg p-3" onChange={handleChange} aria-label="Status">
          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="border rounded-lg px-5 py-3 font-medium">
            {saving? 'Saving...': 'Save Changes'}
          </button>

          <button type="button" onClick={() => router.push('/admin/employees')}
            className="border rounded-lg px-5 py-3">Cancel
          </button>
        </div>
      </form>
    </div>
  )
}