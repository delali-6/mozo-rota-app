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

export function EmployeeProvider({
    children,
}: {
    children: React.ReactNode
}) {

    const [employee, setEmployee] = useState<Employee | null>(null)

    const [loading, setLoading] = useState(true)

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

export function useEmployee() {

    const context = useContext(EmployeeContext)

    if (!context) {

        throw new Error(
            'useEmployee must be used inside EmployeeProvider'
        )

    }

    return context

}