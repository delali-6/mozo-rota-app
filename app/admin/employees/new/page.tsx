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

    const { error } = await supabase.from('employees').insert([ { ...formData, hourly_rate: Number(formData.hourly_rate), contract_hours: Number(formData.contract_hours), holiday_allowance: Number(formData.holiday_allowance) }, ])

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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Add New Employee</h1>
      <p className="text-gray-500 mb-8">Create a new employee record by filling out the form below. All fields are required.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                <input id="first_name" type="text" name="first_name" value={formData.first_name}
                    onChange={handleChange} required placeholder="Enter first name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="First Name"
                />

                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input id="last_name" type="text" name="last_name" value={formData.last_name}
                    onChange={handleChange} required placeholder="Enter last name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Last Name"
                />

                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" type="email" name="email" value={formData.email}
                    onChange={handleChange} required placeholder="Enter email address"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Email"
                />

                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Telephone</label>
                <input id="telephone" type="text" name="telephone" value={formData.telephone}
                    onChange={handleChange} required placeholder="Enter telephone number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Telephone"
                />

                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select id="role" name="role" value={formData.role}
                    onChange={handleChange} required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                </select>

                <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700">Employment Type</label>
                <select id="employment_type" name="employment_type" value={formData.employment_type}
                    onChange={handleChange} required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Employment Type">
                    <option value="part-time">Part-Time</option>
                    <option value="full-time">Full-Time</option>
                </select>

                <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">Hourly Rate (£)</label>
                <input id="hourly_rate" type="number" name="hourly_rate" value={formData.hourly_rate}
                    onChange={handleChange} required step="0.01" placeholder="0.00"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Hourly Rate in pounds"
                />

                <label htmlFor="contract_hours" className="block text-sm font-medium text-gray-700">Contract Hours</label>
                <input id="contract_hours" type="number" name="contract_hours" value={formData.contract_hours}
                    onChange={handleChange} required placeholder="Enter contract hours"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Contract Hours"
                />

                <label htmlFor="holiday_allowance" className="block text-sm font-medium text-gray-700">Holiday Allowance</label>
                <input id="holiday_allowance" type="number" name="holiday_allowance" value={formData.holiday_allowance}
                    onChange={handleChange} required placeholder="Enter holiday allowance"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Holiday Allowance"
                />
            </div>

            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" value={formData.status}
                onChange={handleChange} required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                aria-label="Status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>

            <div className="flex gap-4">
                <button type="submit" disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                    {loading ? "Saving..." : "Save Employee"}
                </button>

                <button type="button" onClick={() => router.push('/admin/employees')}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Cancel
                </button>
            </div>
        </form>
    </div>
  )
}