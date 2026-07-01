'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    role: '',
    job_title: '',
    employment_type: 'part-time',
    hourly_rate: '',
    contract_hours: '',
    holiday_allowance: '',
    status: 'active',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('employees').insert([ { ...formData, job_title: formData.job_title, hourly_rate: Number(formData.hourly_rate), contract_hours: Number(formData.contract_hours), holiday_allowance: Number(formData.holiday_allowance) }, ])

    if (error) {
        console.error(error)
        alert(
          'Failed to add employee'
        )
      } else {
        alert(
          'Employee added successfully!'
        )

        router.push(
          '/admin/employees'
        )
      }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="mozo-title">Add New Employee</h1>
        <p className="mozo-subtitle mt-1">Create a new employee record by filling out the form below.</p>
      </div>

      <form onSubmit={handleSubmit} className="mozo-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="mozo-field-label">First Name</label>
            <input id="first_name" type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Enter first name" className="mozo-input" aria-label="First Name" />
          </div>

          <div>
            <label htmlFor="last_name" className="mozo-field-label">Last Name</label>
            <input id="last_name" type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Enter last name" className="mozo-input" aria-label="Last Name" />
          </div>

          <div>
            <label htmlFor="email" className="mozo-field-label">Email</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email address" className="mozo-input" aria-label="Email" />
          </div>

          <div>
            <label htmlFor="telephone" className="mozo-field-label">Telephone</label>
            <input id="telephone" type="text" name="telephone" value={formData.telephone} onChange={handleChange} required placeholder="Enter telephone number" className="mozo-input" aria-label="Telephone" />
          </div>

          <div>
            <label htmlFor="role" className="mozo-field-label">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required className="mozo-select">
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label htmlFor="job_title" className="mozo-field-label">Job Title</label>
            <input id="job_title" type="text" name="job_title" value={formData.job_title} onChange={handleChange} required placeholder="Enter job title" className="mozo-input" aria-label="Job Title" />
          </div>

          <div>
            <label htmlFor="employment_type" className="mozo-field-label">Employment Type</label>
            <select id="employment_type" name="employment_type" value={formData.employment_type} onChange={handleChange} required className="mozo-select" aria-label="Employment Type">
              <option value="part-time">Part-Time</option>
              <option value="full-time">Full-Time</option>
            </select>
          </div>

          <div>
            <label htmlFor="hourly_rate" className="mozo-field-label">Hourly Rate (£)</label>
            <input id="hourly_rate" type="number" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} required step="0.01" placeholder="0.00" className="mozo-input" aria-label="Hourly Rate in pounds" />
          </div>

          <div>
            <label htmlFor="contract_hours" className="mozo-field-label">Contract Hours</label>
            <input id="contract_hours" type="number" name="contract_hours" value={formData.contract_hours} onChange={handleChange} required placeholder="Enter contract hours" className="mozo-input" aria-label="Contract Hours" />
          </div>

          <div>
            <label htmlFor="holiday_allowance" className="mozo-field-label">Holiday Allowance</label>
            <input id="holiday_allowance" type="number" name="holiday_allowance" value={formData.holiday_allowance} onChange={handleChange} required placeholder="Enter holiday allowance" className="mozo-input" aria-label="Holiday Allowance" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="status" className="mozo-field-label">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mozo-select" aria-label="Status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="mozo-btn mozo-btn-primary">
            {loading ? 'Saving...' : 'Save Employee'}
          </button>

          <button type="button" onClick={() => router.push('/admin/employees')} className="mozo-btn mozo-btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}