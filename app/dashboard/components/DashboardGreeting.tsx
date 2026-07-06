'use client'

import { useEmployee } from '../contexts/EmployeeContext'

export default function DashboardGreeting() {

    const { employee } = useEmployee()

    const hour = new Date().getHours()

    const greeting =
        hour < 12
            ? 'Good Morning'
            : hour < 17
            ? 'Good Afternoon'
            : 'Good Evening'

    return (

        <div className="mb-8">

            <h1 className="text-3xl font-bold text-[#4E342E]">

                {greeting}
                {employee ? `, ${employee.first_name}` : ''}!

            </h1>

            <p className="mt-2 text-gray-600">

                Welcome back to Mozo Café.

            </p>

        </div>

    )

}