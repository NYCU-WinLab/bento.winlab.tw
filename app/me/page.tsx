import { UserProfile } from '@/components/user-profile'
import { UserStats } from '@/components/user-stats'

export default function MePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile />
      <div className="mt-8">
        <UserStats />
      </div>
    </div>
  )
}

