'use client'

type CardProps = {
    children: React.ReactNode
    className?: string
}

export default function Card({
    children,
    className = '',
}: CardProps) {
    return (

        <div
            className={`
                relative
                overflow-hidden
                bg-white
                rounded-3xl
                border
                border-[#E7D8CC]
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
                p-6
                ${className}
            `}
        >

            {/* Coffee accent */}

            <div
                className="
                    absolute
                    top-0
                    left-0
                    w-full
                    h-2
                    bg-gradient-to-r
                    from-[#4E342E]
                    via-[#8D6E63]
                    to-[#C49A6C]
                "
            />

            {children}

        </div>

    )
}