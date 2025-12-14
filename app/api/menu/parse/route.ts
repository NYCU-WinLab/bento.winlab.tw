import { NextRequest, NextResponse } from 'next/server'
import { parseMenuImage } from '@/lib/openai/parse-menu'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const menuItems = await parseMenuImage(file)

    return NextResponse.json({ menu_items: menuItems })
  } catch (error) {
    console.error('Error parsing menu:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse menu' },
      { status: 500 }
    )
  }
}

