import { UserProfile } from '@/components/user-profile'
import { UserStats } from '@/components/user-stats'

export default function MePage() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <UserProfile />
      <div className="mt-4">
        <UserStats />
      </div>
    </div>
  )
}

