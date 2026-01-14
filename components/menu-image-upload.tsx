'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

interface MenuItem {
  name: string
  price: string | number
  type?: string | null
}

export function MenuImageUpload({
  onParseComplete,
}: {
  onParseComplete: (items: MenuItem[]) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/menu/parse', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to parse menu')
      }

      const data = await res.json()
      onParseComplete(data.menu_items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
      />
      {file && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{file.name}</span>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            size="sm"
          >
            {loading ? '解析中...' : '解析菜單'}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

