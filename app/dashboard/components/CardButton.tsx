import Link from 'next/link'

type Props = {
    href: string
    children: React.ReactNode
}

export default function CardButton({
    href,
    children,
}: Props) {

    return (

        <Link
            href={href}
            className="
                mt-6
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-[#6F4E37]
                hover:bg-[#5D4037]
                text-white
                px-5
                py-3
                transition
                w-full
            "
        >

            {children}

        </Link>

    )

}