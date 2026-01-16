# 📋 Installation Commands Summary

This document contains all the terminal commands used to set up the Proyon project.

## 🚀 Initial Setup

### 1. Create Next.js Project
```powershell
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Configuration Selected:**
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router
- ✅ ESLint
- ✅ Import alias: @/*
- ❌ React Compiler (opted out)

### 2. Install Core Dependencies
```powershell
npm install lucide-react class-variance-authority clsx tailwind-merge
```

**Packages Installed:**
- `lucide-react` - Icon library
- `class-variance-authority` - CVA for component variants
- `clsx` - Conditional className utility
- `tailwind-merge` - Merge Tailwind classes intelligently

### 3. Initialize shadcn/ui
```powershell
npx shadcn@latest init -d
```

This automatically:
- Created `components.json` configuration
- Updated `globals.css` with design tokens
- Created `lib/utils.ts` with `cn()` helper
- Installed necessary dependencies

### 4. Install shadcn/ui Components
```powershell
npx shadcn@latest add button card input textarea scroll-area badge accordion dialog sonner
```

**Components Added:**
- `button` - Button component with variants
- `card` - Card container components
- `input` - Form input field
- `textarea` - Multi-line text input
- `scroll-area` - Custom scrollable container
- `badge` - Label/tag component
- `accordion` - Collapsible content
- `dialog` - Modal dialog
- `sonner` - Toast notifications (replaced deprecated toast)

### 5. Create Project Structure
```powershell
New-Item -ItemType Directory -Force -Path "actions", "lib\supabase", "lib\ai", "components\proyon", "types"
```

**Folders Created:**
- `/actions` - Next.js Server Actions
- `/lib/supabase` - Supabase client configuration
- `/lib/ai` - AI helper functions
- `/components/proyon` - Custom Proyon components
- `/types` - TypeScript type definitions

### 6. Start Development Server
```powershell
npm run dev
```

Server runs at: http://localhost:3000

## 📦 Optional Future Installations

### Supabase (Database)
```powershell
npm install @supabase/supabase-js
```

### AI SDKs

**OpenAI:**
```powershell
npm install openai
```

**Anthropic:**
```powershell
npm install @anthropic-ai/sdk
```

### Additional shadcn/ui Components
```powershell
# Add individual components as needed
npx shadcn@latest add [component-name]

# Popular options:
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add tooltip
npx shadcn@latest add calendar
npx shadcn@latest add form
```

## 🔧 Useful Commands

### Development
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Package Management
```powershell
npm install          # Install all dependencies
npm update           # Update packages
npm outdated         # Check for outdated packages
npm audit            # Security audit
```

### Clean Install
```powershell
# If you need to reset node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📊 Final Package.json Dependencies

After all installations, your `package.json` should include:

```json
{
  "dependencies": {
    "next": "16.0.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.xxx.x",
    "class-variance-authority": "^0.x.x",
    "clsx": "^2.x.x",
    "tailwind-merge": "^2.x.x"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.x.x",
    "@types/node": "^22.x.x",
    "@types/react": "^19.x.x",
    "@types/react-dom": "^19.x.x",
    "eslint": "^9.x.x",
    "eslint-config-next": "16.0.10",
    "tailwindcss": "^4.x.x",
    "typescript": "^5.x.x"
  }
}
```

## 🎯 Environment Setup

### Required Files

1. **`.env.local`** (create this file - not in git):
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
OPENAI_API_KEY=your-key
```

2. **`.env.example`** (already created - committed to git):
Template for other developers

## ✅ Verification Checklist

After running all commands, verify:

- [ ] `node_modules/` folder exists
- [ ] `package-lock.json` is generated
- [ ] `components/ui/` contains shadcn components
- [ ] `lib/utils.ts` exists
- [ ] Development server starts without errors
- [ ] http://localhost:3000 displays the Proyon homepage
- [ ] No TypeScript errors (except noted CSS lint warnings)
- [ ] All custom folders exist (actions, lib/supabase, etc.)

## 🚨 Known Issues & Notes

1. **CSS Lint Warnings**: The `@apply`, `@theme`, and `@custom-variant` warnings in `globals.css` are expected with Tailwind v4 and won't affect functionality.

2. **Supabase Import Error**: Expected until you install `@supabase/supabase-js` package.

3. **Tailwind Config**: Tailwind v4 uses CSS-based configuration in `globals.css` instead of `tailwind.config.ts`.

## 📚 Resources

- [Next.js CLI Docs](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [npm Documentation](https://docs.npmjs.com/)

---

**All commands executed successfully! ✅**

Total installation time: ~2-3 minutes
Project is ready for development!
