This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Prototype: Secure Academic Notes Platform

### Routes

- **`/login`**
- **`/dashboard`** (role-based)
- **`/notes/[id]`** (PDF viewer)

### Credentials (seeded)

- **Lecturer**: `lecturer@example.com` / `password`
- **Student**: `student@example.com` / `password`

### Storage

- **Database**: `.data/db.json`
- **Uploaded PDFs**: `.data/uploads/*.pdf`

### Security notes (prototype-level)

- All backend operations use **Server Actions only** (no API routes).
- Sessions use an **HTTP-only cookie** (`an_session`) signed with `SESSION_SECRET`.
- The viewer disables right-click and common copy/save/print shortcuts.
- PDFs are not exposed via direct URLs; the viewer loads bytes via a Server Action and renders from a Blob URL.
- This discourages copying but cannot fully prevent screenshots or advanced extraction.

### Optional env

Set a stronger cookie signing secret:

```bash
SESSION_SECRET="replace-with-a-long-random-string"
```

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
