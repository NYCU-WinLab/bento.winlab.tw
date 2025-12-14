# Bento

> WinLab Meeting Lunch Ordering System

## ✨ Features

### User Features

- 📋 **Order Management**: View all orders (active/completed), click to see details
- 🍱 **Order Items**: Add items to active orders with optional "no sauce" option
- 🗑️ **Delete Items**: Delete your own order items
- 🏪 **Restaurant Browse**: View all restaurants, menu items, prices, and statistics
- ⭐ **Rating System**: Rate menu items from 1-5 stars
- 📊 **Personal Statistics**: View order participation count, total spending, most ordered items and restaurants

### Admin Features

- ➕ **Restaurant Management**: Add, edit, and delete restaurants
- 📸 **AI Menu Parsing**: Upload menu images and use OpenAI Vision API to automatically parse items and prices
- 📝 **Order Management**: Create new orders and close active orders
- ⏰ **Auto Close**: Set automatic order closing time

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication**: Google OAuth
- **AI Parsing**: OpenAI Vision API
- **Package Manager**: Bun

## 📄 License

MIT License. See [LICENSE.md](LICENSE.md) for details.
