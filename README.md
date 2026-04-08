# PawaMore Systems - E-commerce Platform

> **Empowering Nigerians to Take Control of Their Electricity**  
> A full-stack e-commerce platform for solar power systems, inverters, batteries, and renewable energy solutions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Features Deep Dive](#core-features-deep-dive)
- [API & Integrations](#api--integrations)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**PawaMore Systems** is a modern, full-featured e-commerce platform built specifically for the Nigerian renewable energy market. It addresses the critical pain points of unreliable electricity through:

- **Solar Power Systems** - Complete solar solutions for homes and businesses
- **Battery Systems** - LiFePO4 and deep-cycle batteries with intelligent management
- **Inverters** - Pure sine wave inverters from 1KVA to 10KVA+
- **Accessories** - Charge controllers, cables, panels, and installation materials

The platform combines elegant UX, powerful e-commerce capabilities, and Nigerian-specific features like Naira formatting, Flutterwave payments, and WhatsApp integration.

---

## ✨ Key Features

### 🛒 **E-commerce Core**
- ✅ Product catalog with advanced filtering (category, brand, price, rating, stock)
- ✅ Product detail pages with image galleries, specs, and reviews
- ✅ Shopping cart with real-time updates and persistence
- ✅ Wishlist functionality for authenticated users
- ✅ Guest checkout (no account required)
- ✅ Quick Buy feature for one-click purchases
- ✅ Order tracking and history
- ✅ Search with autocomplete

### 💰 **Payment & Orders**
- ✅ **Flutterwave Integration** - Card, bank transfer, USSD
- ✅ Guest orders with email confirmation
- ✅ Order status tracking (pending, processing, shipped, delivered)
- ✅ Invoice generation and PDF receipts
- ✅ Order lookup for guests (email + order number)

### ⚡ **Solar Calculator**
- ✅ Interactive appliance-based load calculator
- ✅ Real-time power consumption analysis
- ✅ Automatic system recommendations:
  - Battery capacity (kWh)
  - Inverter size (W)
  - Solar panel quantity
- ✅ Cost estimation in Naira
- ✅ Pre-loaded common appliances
- ✅ Add/remove/edit custom appliances

### 🤖 **AI Support Chat**
- ✅ Powered by Supabase Edge Functions
- ✅ Context-aware product recommendations
- ✅ Order tracking assistance
- ✅ Technical support & FAQs
- ✅ Guest and authenticated user modes
- ✅ Conversation history persistence
- ✅ Markdown response formatting

### 📱 **Communication**
- ✅ WhatsApp Business integration (quick inquiries)
- ✅ Contact forms with email notifications
- ✅ Newsletter subscription
- ✅ Order confirmation emails
- ✅ Live chat widget

### 👤 **User Management**
- ✅ Authentication (email/password)
- ✅ User profiles with address management
- ✅ Order history
- ✅ Wishlist
- ✅ Password reset flow
- ✅ Guest checkout

### 🎨 **UI/UX**
- ✅ Fully responsive (mobile-first)
- ✅ Dark mode ready
- ✅ Smooth animations (Framer Motion)
- ✅ Scroll-to-top button (positioned above chat)
- ✅ Toast notifications
- ✅ Loading states & skeletons
- ✅ Error boundaries

### 🔧 **Admin Dashboard**
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ Customer analytics
- ✅ Inventory tracking
- ✅ Sales reports
- ✅ Review moderation

### 📊 **SEO & Performance**
- ✅ Dynamic meta tags per page
- ✅ Semantic HTML
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 5.4 | Build tool |
| **React Router** | 6.30 | Routing |
| **TanStack Query** | 5.83 | Data fetching & caching |
| **Tailwind CSS** | 3.4 | Styling |
| **shadcn/ui** | Latest | UI components |
| **Framer Motion** | 12.35 | Animations |
| **Lucide React** | 0.462 | Icons |
| **React Hook Form** | 7.61 | Form management |
| **Zod** | 3.25 | Schema validation |
| **React Markdown** | 10.1 | Chat message rendering |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Database |
| **Edge Functions** | Serverless API (Deno runtime) |
| **Row Level Security** | Data protection |
| **Supabase Auth** | User authentication |
| **Supabase Storage** | File uploads |

### **Integrations**
- **Flutterwave** - Payment processing
- **WhatsApp Business API** - Customer communication
- **Email Service** - Transactional emails

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ or Bun
- npm/pnpm/yarn/bun
- Supabase account (free tier works)
- Flutterwave account (for payments)

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/pawamore.git
cd pawamore

# 2. Install dependencies
npm install
# or
bun install

# 3. Set up environment variables
cp .env.example .env
```

### **Environment Variables**

Create `.env` file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FLUTTERWAVE_PUBLIC_KEY=your-flw-public-key
VITE_WHATSAPP_NUMBER=2347062716154
```

### **Database Setup**

```bash
# Run migrations
cd supabase
supabase db reset

# Or use Supabase Dashboard SQL Editor
# Copy/paste migration files from supabase/migrations/
```

### **Development**

```bash
# Start dev server
npm run dev

# Runs on http://localhost:5173
```

### **Build**

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
pawamore/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── shop/           # Shop-specific components
│   │   ├── support/        # LiveChat, help components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Navbar.tsx      # Navigation
│   │   ├── Footer.tsx      # Footer
│   │   ├── SolarCalculator.tsx  # Calculator component
│   │   ├── ScrollToTop.tsx # Scroll-to-top button
│   │   └── ...
│   ├── pages/              # Route pages
│   │   ├── Index.tsx       # Homepage
│   │   ├── Shop.tsx        # Product listing
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── SolarCalculatorPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── hooks/              # Custom hooks
│   │   ├── use-toast.ts
│   │   └── useSEO.ts
│   ├── integrations/       # External integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/                # Utilities
│   │   └── utils.ts        # formatNaira, cn, etc.
│   ├── App.tsx             # App root
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── ai-support-chat/
│   │   ├── create-guest-order/
│   │   ├── verify-payment/
│   │   ├── get-flutterwave-key/
│   │   ├── send-order-receipt/
│   │   └── send-newsletter/
│   └── migrations/         # SQL migrations
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🔍 Core Features Deep Dive

### **1. Solar Calculator** ⚡

**Location**: `/solar-calculator`

**How it works**:
1. User adds appliances (TV, fridge, laptop, etc.)
2. Inputs wattage, daily usage hours, and quantity
3. Calculator computes:
   - **Daily energy consumption** (Wh → kWh)
   - **Peak load** (simultaneous usage)
   - **Battery size needed** (with 20% buffer)
   - **Inverter capacity** (with 30% overhead)
   - **Solar panel quantity** (assuming 4 peak sun hours)
   - **Estimated cost in Naira**

**Formula examples**:
```typescript
totalDailyConsumption = Σ(watts × hours × quantity)
recommendedBattery = (totalDailyConsumption × 1.2) / 1000  // kWh
recommendedInverter = Math.ceil(totalPeakLoad × 1.3)       // W
recommendedPanels = Math.ceil((totalDailyConsumption / 1000) / 4)
```

**Features**:
- Pre-loaded common appliances
- Add custom appliances
- Edit/remove appliances
- Real-time calculation updates
- Cost breakdown
- CTA for consultation

---

### **2. Quick Buy Flow** 🚀

**How it works**:
1. User clicks "Quick Buy" on product card
2. Modal opens with shipping form
3. For **authenticated users**: email pre-filled from profile
4. For **guest users**: all fields required
5. Order created in database (`orders` + `order_items`)
6. Flutterwave checkout launched
7. Payment verification via webhook
8. Order status updated
9. Email receipt sent

**Guest users**:
- No account required
- Order lookup via email + order number
- Receive email confirmation
- Can track order via `/order-lookup`

---

### **3. AI Support Chat** 🤖

**Powered by**: Supabase Edge Function (`ai-support-chat`)

**Capabilities**:
- Product recommendations based on user needs
- Order status inquiries
- Technical support (installation, troubleshooting)
- FAQ answering
- Lead qualification

**Features**:
- Markdown response rendering
- Conversation history (stored in database)
- Guest mode support
- Typing indicators
- Minimize/maximize
- Positioned bottom-right (above scroll-to-top)

**Tech stack**:
- React + TypeScript (frontend)
- Supabase Edge Functions (backend)
- OpenAI/Anthropic API (LLM)
- Conversation persistence in PostgreSQL

---

### **4. Payment Flow** 💳

**Integration**: Flutterwave

**Supported methods**:
- Credit/Debit cards
- Bank transfer
- USSD
- Mobile money

**Flow**:
1. User completes checkout
2. Order created (status: `pending`)
3. Flutterwave modal launched
4. Payment processed
5. Webhook verification (`verify-payment` edge function)
6. Order status → `processing`
7. Receipt emailed
8. Admin notified

**Security**:
- Public key exposed only to frontend
- Secret key stored in Supabase Edge Function secrets
- Payment verification server-side only
- Transaction ID validation

---

## 🔌 API & Integrations

### **Supabase Edge Functions**

| Function | Method | Purpose |
|---------|--------|---------|
| `ai-support-chat` | POST | AI chatbot responses |
| `create-guest-order` | POST | Create order for non-authenticated users |
| `verify-payment` | POST | Verify Flutterwave transactions |
| `get-flutterwave-key` | GET | Fetch public key securely |
| `send-order-receipt` | POST | Email order confirmation |
| `send-newsletter` | POST | Newsletter subscription |
| `scrape-product-from-url` | POST | AI product import (modal) |
| `scrape-product` | POST | AI product import (Scraper tab) |

### **Example: Create Guest Order**

```typescript
const { data, error } = await supabase.functions.invoke("create-guest-order", {
  body: {
    guest_email: "customer@example.com",
    shipping_name: "John Doe",
    shipping_phone: "08012345678",
    shipping_address: "123 Street",
    shipping_city: "Lagos",
    payment_method: "flutterwave",
    items: [{ product_id: "uuid", quantity: 2 }],
  },
});
```

---

## 🗄️ Database Schema

### **Key Tables**

#### `products`
```sql
- id (uuid, PK)
- name (text)
- slug (text, unique)
- description (text)
- price (numeric)
- discount_price (numeric, nullable)
- category (text)
- brand (text)
- stock_quantity (int)
- images (text[])
- is_featured (boolean)
- rating (numeric)
- created_at (timestamp)
```

#### `orders`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users, nullable for guests)
- guest_email (text, nullable)
- total_amount (numeric)
- status (enum: pending, processing, shipped, delivered, cancelled)
- payment_method (text)
- shipping_name/phone/address/city (text)
- created_at (timestamp)
```

#### `order_items`
```sql
- id (uuid, PK)
- order_id (uuid, FK → orders)
- product_id (uuid, FK → products)
- product_name (text)
- quantity (int)
- unit_price (numeric)
```

#### `wishlist`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- product_id (uuid, FK → products)
- created_at (timestamp)
- UNIQUE(user_id, product_id)
```

#### `cart_items`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- product_id (uuid, FK → products)
- quantity (int)
- created_at (timestamp)
```

#### `support_conversations`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users, nullable)
- guest_id (text, nullable)
- messages (jsonb[])
- created_at (timestamp)
```

### **Row Level Security (RLS)**

All tables have RLS enabled:
- Users can only access their own data
- Guests can access orders via email verification
- Admin role has full access
- Public read access for products

---

## 🎨 UI Components

### **Key shadcn/ui Components Used**
- Button, Input, Textarea, Label
- Card, Dialog, Sheet, Drawer
- Select, Dropdown Menu, Popover
- Toast, Sonner (notifications)
- Tabs, Accordion, Collapsible
- Badge, Avatar, Separator
- Scroll Area, Progress
- Command (search)

### **Custom Components**
- `SolarCalculator` - Load calculator
- `ProductCard` - Product display with Quick Buy
- `WhatsAppButton` - Pre-filled WhatsApp links
- `QuickBuyButton` - One-click checkout
- `ScrollToTop` - Smooth scroll button
- `LiveChat` - AI support widget
- `Layout` - App wrapper with nav/footer

---

## 🚢 Deployment

### **Frontend** (Netlify/Vercel)

```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod

# Or Vercel
vercel --prod
```

### **Backend** (Supabase)

```bash
# Deploy Edge Functions
supabase functions deploy ai-support-chat
supabase functions deploy create-guest-order
supabase functions deploy verify-payment

# Set secrets
supabase secrets set FLUTTERWAVE_SECRET_KEY=your-secret-key
supabase secrets set OPENAI_API_KEY=your-openai-key
```

### **Environment Variables (Production)**

Set in hosting platform:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_FLUTTERWAVE_PUBLIC_KEY=your-live-flw-key
VITE_WHATSAPP_NUMBER=2347062716154
```

---


## 🤖 AI Product Scraper

See [`AI_PRODUCT_SCRAPER_PLAN.md`](./AI_PRODUCT_SCRAPER_PLAN.md) for the full architecture.

Two scraper approaches are available:

| Approach | Edge Function | Admin UI | Audit Table |
|---|---|---|---|
| **Quick Import** (modal) | `scrape-product-from-url` | "Import from URL" button in Products tab | `product_import_logs` |
| **Background Scraper** (tab) | `scrape-product` | "Scraper" tab in Admin Dashboard | `scraper_runs` |

### Running locally

```sh
supabase start && supabase db push
supabase functions serve scrape-product --env-file .env.local
```

---

## 🧪 Running Tests

```sh
npm run test          # run once
npm run test:watch    # watch mode
```

Test files live in `src/test/`. Scraper utility tests: `src/test/scraper.test.ts`.

---

## 📈 Roadmap

### **In Progress**
- [ ] Paystack integration (alternative to Flutterwave)
- [ ] Product review photos
- [ ] Advanced analytics dashboard
- [ ] Inventory alerts

### **Planned**
- [ ] Mobile app (React Native)
- [ ] Referral program
- [ ] Loyalty points
- [ ] Blog with CMS
- [ ] Multi-language support (Yoruba, Hausa, Igbo)
- [ ] SMS notifications
- [ ] Social login (Google, Facebook)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 💬 Support

- **Email**: support@pawamore.com
- **WhatsApp**: +234 706 271 6154
- **Live Chat**: Available on website

---

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful components
- **Supabase** for incredible backend tools
- **Tailwind CSS** for utility-first styling
- **Flutterwave** for seamless payments
- **Nigerian developers** making a difference 🇳🇬

---

**Built with ❤️ for Nigeria's energy future**
