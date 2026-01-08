'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserProfileSkeleton } from './skeletons/user-profile-skeleton'
import { useEffect, useState } from 'react'

type Identity = {
  id: string
  provider: string
  identity_data?: {
    email?: string
    name?: string
    avatar_url?: string
  }
}

export function UserProfile() {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const supabase = createClient()
  const [identities, setIdentities] = useState<Identity[]>([])
  const [linking, setLinking] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Get current identities from user object
      const userIdentities = (user.identities || []) as Identity[]
      setIdentities(userIdentities)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLinkIdentity = async (provider: 'google' | 'keycloak') => {
    if (!user) return

    setLinking(provider)
    try {
      // When user is already logged in, signInWithOAuth will automatically
      // link the new identity to the current user if the email matches
      // If email doesn't match, Supabase will create a new account
      // In that case, you'd need to use Admin API to manually link them
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/api/auth/callback?next=/me`,
          scopes: provider === 'keycloak' ? 'openid' : undefined,
          // This ensures the identity is linked to the current user
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Error linking identity:', error)
        alert(`連結 ${provider} 失敗: ${error.message}`)
        setLinking(null)
      }
      // If successful, the user will be redirected to OAuth provider
      // and then back to callback, which will update the session
    } catch (error) {
      console.error('Error linking identity:', error)
      alert(`連結 ${provider} 失敗`)
      setLinking(null)
    }
  }

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      google: 'Google',
      keycloak: 'Keycloak',
      email: 'Email',
    }
    return names[provider] || provider
  }

  const isLinked = (provider: string) => {
    return identities.some((identity) => identity.provider === provider)
  }

  if (loading) {
    return <UserProfileSkeleton />
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">請先登入</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>個人資訊</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">
              {user.user_metadata?.name || user.email}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Identity Linking Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">已連結的帳號</h3>
          </div>
          <div className="space-y-2">
            {identities.length > 0 ? (
              identities.map((identity) => (
                <div
                  key={identity.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getProviderDisplayName(identity.provider)}
                    </Badge>
                    {identity.identity_data?.email && (
                      <span className="text-sm text-muted-foreground">
                        {identity.identity_data.email}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    已綁定
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                目前沒有已連結的帳號
              </p>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-sm">綁定其他帳號</h4>
            <div className="grid gap-2">
              {!isLinked('google') && (
                <Button
                  variant="outline"
                  onClick={() => handleLinkIdentity('google')}
                  disabled={!!linking}
                  className="justify-start"
                >
                  {linking === 'google' ? '連結中...' : '綁定 Google'}
                </Button>
              )}
              {!isLinked('keycloak') && (
                <Button
                  variant="outline"
                  onClick={() => handleLinkIdentity('keycloak')}
                  disabled={!!linking}
                  className="justify-start"
                >
                  {linking === 'keycloak' ? '連結中...' : '綁定 Keycloak'}
                </Button>
              )}
              {isLinked('google') && isLinked('keycloak') && (
                <p className="text-sm text-muted-foreground">
                  所有可用的帳號都已綁定
                </p>
              )}
            </div>
          </div>
        </div>

        <Button variant="destructive" onClick={handleLogout} className="w-full">
          登出
        </Button>
      </CardContent>
    </Card>
  )
}

