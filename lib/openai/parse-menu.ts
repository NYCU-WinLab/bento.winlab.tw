import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MenuItem {
  name: string
  price: string
}

export async function parseMenuImage(imageFile: File): Promise<MenuItem[]> {
  try {
    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = imageFile.type

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this menu image and extract all menu items with their prices. Return a JSON array in this exact format:
[
  { "name": "Menu Item", "price": "Item Price" },
  ...
]

Only return the JSON array, no other text. Prices should be strings.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const menuItems: MenuItem[] = JSON.parse(jsonMatch[0])

    // Validate structure
    if (!Array.isArray(menuItems)) {
      throw new Error('Response is not an array')
    }

    return menuItems.map((item) => ({
      name: item.name?.trim() || '',
      price: item.price?.trim() || '',
    }))
  } catch (error) {
    console.error('Error parsing menu image:', error)
    throw new Error(`Failed to parse menu: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

