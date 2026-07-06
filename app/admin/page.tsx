// Manager dashboard overview. Current figures are placeholders until reporting queries are added.
export default function AdminPage() {
  return (
    <div>
      <h1 className="mozo-title mb-2">
        Welcome back,
        Manager 👋
      </h1>

      <p className="mozo-subtitle mb-8">
        Here’s what’s happening today.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="mozo-card p-5">
          <h2 className="font-semibold">
            Staff On Shift
          </h2>
          <p className="text-3xl mt-2">
            6
          </p>
        </div>

        <div className="mozo-card p-5">
          <h2 className="font-semibold">
            Pending Swaps
          </h2>
          <p className="text-3xl mt-2">
            2
          </p>
        </div>

        <div className="mozo-card p-5">
          <h2 className="font-semibold">
            Leave Requests
          </h2>
          <p className="text-3xl mt-2">
            1
          </p>
        </div>
      </div>
    </div>
  )
}
