'use client'

import NotificationsCard from '../components/NotificationsCard'

export default function FeedPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#4E342E]">Feed</h1>
        <p className="mt-1 text-[#7A6A61]">
          Announcements, shift offers, holiday updates, and rota changes.
        </p>
      </div>

      <NotificationsCard />
    </main>
  )
}
