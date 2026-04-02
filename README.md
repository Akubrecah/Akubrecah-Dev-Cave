# Akubrecah - KRA Compliance & PDF Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CD1?style=for-the-badge&logo=stripe)](https://stripe.com/)

**One Suite. Infinite Power.**

Akubrecah is a professional-grade, unified platform designed for Kenyan taxpayers and global document professionals. It seamlessly integrates essential **KRA (Kenya Revenue Authority) Compliance** services with a comprehensive suite of **88+ Browser-Based PDF Tools**.

---

### 📊 Project Intelligence & Velocity

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=Akubrecah&show_icons=true&theme=tokyonight&hide_border=true&bg_color=0D1117&title_color=EAB308&icon_color=EAB308&text_color=FFFFFF" alt="Akubrecah GitHub Stats" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=Akubrecah&theme=tokyonight&hide_border=true&background=0D1117&ring=EAB308&fire=EAB308&stroke=EAB308&currStreakNum=FFFFFF&sideNums=FFFFFF&sideLabels=FFFFFF&dates=FFFFFF" alt="GitHub Streak" />
</p>

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Akubrecah&layout=compact&theme=tokyonight&hide_border=true&bg_color=0D1117&title_color=EAB308&text_color=FFFFFF" alt="Top Languages" />
</p>

---

## 🚀 Core Features

### 🇰🇪 KRA Gateway (Compliance Simplified)
Empowering Kenyan taxpayers with instant, reliable compliance tools:
- **PIN Verification**: Instantly verify KRA PINs by ID number or PIN.
- **Nil Return Filing**: File your Nil returns in seconds with automated validation.
- **Compliance Tracking**: Keep tabs on your tax obligations with a professional dashboard.
- **Secure Integration**: Direct, encrypted communication with KRA API endpoints.

### 📄 PDF Mastery Suite (88+ Professional Tools)
A powerhouse for document management, processed entirely in your browser for maximum privacy.
- **Conversion**: PDF to Word, Excel, PowerPoint, Image, and Markdown.
- **Manipulation**: Merge, Split, Rotate, Delete Pages, and Reorder.
- **Optimization**: Bank-grade compression and linearize for web.
- **Security**: Password protection, PDF Signing (e-signature), and Watermarking.
- **Advanced OCR**: AI-powered text extraction from scanned documents using Tesseract.js.
- **Local Processing**: Powered by LibreOffice WASM and pdf-lib—your sensitive data never leaves your device.

---

## 🛠 Technical Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Authentication** | [Clerk](https://clerk.com/) |
| **Database** | [Prisma](https://www.prisma.io/) with [Neon](https://neon.tech/) (PostgreSQL) |
| **Payments** | [Stripe](https://stripe.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **PDF Core** | LibreOffice WASM, `pdf-lib`, `pdfjs-dist`, `jspdf`, `html2pdf.js`, `zgapdfsigner` |
| **OCR** | [Tesseract.js](https://tesseract.projectnaptha.com/) |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) |

---

## 🏗 Architecture Highlights

- **Privacy-First Design**: Heavy-duty document processing is performed on the client-side using WebAssembly (WASM), ensuring user documents are never uploaded to our servers.
- **Global Ready**: Fully localized routing and content management system via `next-intl`.
- **Serverless Performance**: Optimized for Vercel with serverless edge functions and Neon's autoscaling database.
- **Modern UI**: A premium dark-mode aesthetic with interactive micro-animations and responsive layouts.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL (or Neon account)
- Clerk account
- Stripe account (for payments)

### 1. Clone & Install
```bash
git clone https://github.com/AkubrecaH/AkubrecaH-Dev-Cave.git
cd AkubrecaH-Dev-Cave
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and populate it with the following:

```env
# Database
DATABASE_URL="your_postgresql_url"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# KRA API Credentials
KRA_ID_CONSUMER_KEY="your_key"
KRA_ID_CONSUMER_SECRET="your_secret"
KRA_PIN_CONSUMER_KEY="your_key"
KRA_PIN_CONSUMER_SECRET="your_secret"
KRA_NIL_CONSUMER_KEY="your_key"
KRA_NIL_CONSUMER_SECRET="your_secret"
KRA_NIL_API_BASE_URL="https://api.kra.go.ke" # or sandbox
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚢 Deployment

The project is optimized for deployment on the **Vercel Platform**. 

1. Push your code to GitHub.
2. Link your repository to a new Vercel project.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is private and proprietary. © 2026 AkubrecaH Team.
