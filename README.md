# Chore Tracker App

A fun, colorful chore tracker for kids built with Next.js and Tailwind CSS.

## Features

- 🎨 Bright, kid-friendly interface
- ⭐ Points system with running total
- 📱 Mobile-responsive design
- 🔄 Auto-resets daily at midnight
- 💾 Saves progress in browser (localStorage)
- 🎉 Celebration animation when all chores complete

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd chore-tracker-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts (just hit enter to accept defaults)

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Click "Deploy" (Vercel auto-detects Next.js settings)

That's it! Your app will be live in seconds.

## Customization

To modify chores, edit the `chores` array in `/components/ChoreTracker.tsx`:

```typescript
const [chores, setChores] = useState<Chore[]>([
  { id: 1, name: '🦷 Brush Teeth (Morning)', points: 1, completed: false, emoji: '🌅' },
  // Add or modify chores here
]);
```

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **localStorage** - Data persistence

## License

MIT
