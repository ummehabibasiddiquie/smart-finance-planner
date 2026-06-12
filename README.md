# Smart Finance Planner

Plan Loans. Optimize EMIs. Build Wealth.

Production-ready personal finance, loan planning & wealth management platform built with:
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Zustand (LocalStorage persistence)
- React Hook Form + Zod validation
- Recharts + TanStack Table
- Export: XLSX + jsPDF

## Folder Structure (high level)

```
src/
  app/
    (app)/
      dashboard/
      loan-calculator/
      loan-comparison/
      emi-growth-planner/
      prepayment-planner/
      amortization-schedule/
      affordability-calculator/
      rent-vs-buy/
      family-contribution-planner/
      goal-planner/
      investment-planner/
      scenario-comparison/
      financial-insights/
      reports/
      settings/
    globals.css
    layout.tsx
    providers.tsx
  components/
    charts/
    layout/
    ui/
  config/
  hooks/
  lib/
    finance/
    export/
  store/
```

## Installation

```bash
npm install
```

## Run (Dev)

```bash
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Environment Variables

No environment variables are required. All persistence is handled via Local Storage.

## Deployment (Vercel)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build` (default)
5. Output: handled automatically by Next.js.
6. Deploy.

## Notes
- Exports (PDF/Excel) run client-side in the browser.
- Financial calculations are deterministic utilities in `src/lib/finance`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
