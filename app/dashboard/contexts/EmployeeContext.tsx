'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'

import { getCurrentEmployee } from '@/lib/auth'

type Employee = {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
    job_title: string
    holiday_allowance: number
    auth_user_id: string
}

type EmployeeContextType = {
    employee: Employee | null
    loading: boolean
    refreshEmployee: () => Promise<void>
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

// Provides the logged-in employee record to all employee dashboard pages and cards.
export function EmployeeProvider({
    children,
}: {
    children: React.ReactNode
}) {

    const [employee, setEmployee] = useState<Employee | null>(null)

    const [loading, setLoading] = useState(true)

    // Refreshes employee profile data after login or when a child page changes employee-owned data.
    const refreshEmployee = async () => {

        setLoading(true)

        const data = await getCurrentEmployee()

        setEmployee(data)

        setLoading(false)
    }

    useEffect(() => {
        const id = window.setTimeout(() => {
            void refreshEmployee()
        }, 0)

        return () => window.clearTimeout(id)
    }, [])


    return (

        <EmployeeContext.Provider
            value={{
                employee,
                loading,
                refreshEmployee,
            }}
        >

            {children}

        </EmployeeContext.Provider>

    )

}

// Convenience hook that keeps employee-only UI from being used outside the provider.
export function useEmployee() {

    const context = useContext(EmployeeContext)

    if (!context) {

        throw new Error(
            'useEmployee must be used inside EmployeeProvider'
        )

    }

    return context

}
