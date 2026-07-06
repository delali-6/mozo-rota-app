import Link from 'next/link'

type Props = {
    title: string
    icon: React.ReactNode
    actionText?: string
    actionHref?: string
}

// Shared card heading row with an optional action link to the full page.
export default function SectionHeader({
    title,
    icon,
    actionText,
    actionHref,
}: Props) {

    return (

        <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

                {icon}

                <h2 className="text-xl font-bold text-[#4E342E]">

                    {title}

                </h2>

            </div>

            {actionHref && (

                <Link
                    href={actionHref}
                    className="
                        text-sm
                        font-medium
                        text-[#6F4E37]
                        hover:underline
                    "
                >

                    {actionText}

                </Link>

            )}

        </div>

    )

}
