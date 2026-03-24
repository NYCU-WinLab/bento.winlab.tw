interface UserProfile {
  roles?: { bento?: string[] } | null
}

export function checkIsAdmin(profile: UserProfile | null): boolean {
  if (profile?.roles && typeof profile.roles === 'object') {
    const bentoRoles = profile.roles.bento
    if (Array.isArray(bentoRoles)) {
      return bentoRoles.includes('admin')
    }
  }
  return false
}
