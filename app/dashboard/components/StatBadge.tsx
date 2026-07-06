type Props = {
    children: React.ReactNode
}

export default function StatBadge({
    children,
}: Props) {

    return (

        <span
            className="
                inline-block
                px-3
                py-1
                rounded-full
                bg-[#EFE5DB]
                text-[#4E342E]
                text-sm
                font-medium
            "
        >

            {children}

        </span>

    )

}