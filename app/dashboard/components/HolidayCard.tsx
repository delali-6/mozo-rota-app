'use client'

import Card from './Card'

// Static holiday balance card kept for reuse when holiday data is connected to the dashboard again.
export default function HolidayCard() {

    return (

        <Card>

            <h2 className="text-xl font-semibold text-[#4E342E]">

                🏖 Holiday Balance

            </h2>

            <p className="mt-6 text-4xl font-bold text-[#6F4E37]">

                28 Days

            </p>

            <p className="text-gray-500">

                Annual allowance

            </p>

        </Card>

    )

}
