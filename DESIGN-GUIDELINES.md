# 🎨 Proyon Design System Guidelines

## Overview

Proyon uses a **Cyber-Professional** design aesthetic inspired by [gazla.co](https://gazla.co), featuring:
- Always-on dark mode
- Glass morphism effects
- Neon accents (Electric Violet to Neon Fuchsia)
- Subtle noise textures
- Translucent cards with backdrop blur

## 🎨 Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Slate | `#020617` | Main background |
| Slate 900 | `rgba(15, 23, 42, 0.5)` | Card backgrounds |
| Electric Violet | `#7c3aed` | Primary actions, links |
| Neon Fuchsia | `#d946ef` | Gradient endpoints |
| Cyan | `#22d3ee` | Secondary actions, accents |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| White | `#f8fafc` | Primary text |
| Slate 400 | `#94a3b8` | Muted/secondary text |
| Slate 700 | `rgba(51, 65, 85, 0.5)` | Disabled text |

### Status Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Success | `#10b981` | Success states |
| Warning | `#f59e0b` | Warning states |
| Error | `#ef4444` | Error states |
| Info | `#22d3ee` | Informational |

## 📐 Spacing Scale

Follow Tailwind's default spacing scale:
- `p-2` (0.5rem / 8px)
- `p-4` (1rem / 16px)
- `p-6` (1.5rem / 24px)
- `p-8` (2rem / 32px)
- `p-12` (3rem / 48px)
- `p-16` (4rem / 64px)

## 🔤 Typography

### Font Family
- **Primary**: Geist Sans (default from Next.js)
- **Monospace**: Geist Mono (for code)

### Font Sizes

| Size | Class | Usage |
|------|-------|-------|
| 3xl-6xl | `text-3xl` to `text-6xl` | Page titles, hero text |
| 2xl | `text-2xl` | Section headers |
| xl | `text-xl` | Card titles |
| lg | `text-lg` | Large body text |
| base | `text-base` | Default body text |
| sm | `text-sm` | Small text, labels |
| xs | `text-xs` | Captions, helper text |

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| Bold | `font-bold` | Headings |
| Semibold | `font-semibold` | Subheadings |
| Medium | `font-medium` | Emphasis |
| Normal | `font-normal` | Body text |

## 🎭 Component Patterns

### 1. Glass Cards

Use for main content containers:

```tsx
<GlassCard hover neonBorder>
  <h3 className="text-xl font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</GlassCard>
```

**Properties:**
- `hover` - Adds scale and glow on hover
- `neonBorder` - Adds primary-colored border
- `className` - Additional Tailwind classes

### 2. Gradient Text

Use for important headings and brand elements:

```tsx
<GradientText as="h1" className="text-5xl font-bold">
  Proyon
</GradientText>
```

**Alternative:**
```tsx
<h1 className="gradient-text text-5xl font-bold">
  Proyon
</h1>
```

### 3. Buttons

**Primary Action (with glow):**
```tsx
<Button className="neon-glow bg-primary hover:bg-primary/90">
  <Icon className="w-4 h-4 mr-2" />
  Primary Action
</Button>
```

**Secondary Action:**
```tsx
<Button variant="outline" className="border-primary/30 hover:bg-primary/10">
  Secondary Action
</Button>
```

**Gradient Button:**
```tsx
<Button className="bg-gradient-to-r from-primary to-[#d946ef]">
  Special Action
</Button>
```

### 4. Badges

**Status Badges:**
```tsx
<Badge className="neon-glow">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
```

**Gradient Badge:**
```tsx
<Badge className="bg-gradient-to-r from-primary to-[#d946ef]">
  Premium
</Badge>
```

## 🎨 Utility Classes

### Custom Utilities

| Class | Effect |
|-------|--------|
| `.gradient-text` | Electric Violet to Neon Fuchsia gradient text |
| `.neon-glow` | Soft purple glow effect |
| `.glass` | Glass morphism (blur + semi-transparent) |

### Usage Examples

```tsx
{/* Gradient text */}
<h1 className="gradient-text text-4xl">Title</h1>

{/* Neon glow */}
<div className="neon-glow rounded-lg p-6">Glowing box</div>

{/* Glass effect */}
<div className="glass rounded-lg p-6">Glass container</div>
```

## 📏 Layout Patterns

### Container Widths
- **Full width**: No max-width
- **Wide**: `max-w-7xl` (1280px)
- **Standard**: `max-w-6xl` (1152px)
- **Narrow**: `max-w-4xl` (896px)
- **Reading**: `max-w-2xl` (672px)

### Grid Layouts

**Responsive Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

**Auto-fit Grid:**
```tsx
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  {/* Items */}
</div>
```

## 🎭 Animation Guidelines

### Hover States
- **Scale**: `hover:scale-[1.02]` for cards
- **Opacity**: `hover:opacity-80` for images
- **Background**: `hover:bg-primary/10` for subtle effects

### Transitions
Always add transitions for smooth animations:
```tsx
className="transition-all duration-300"
```

### Motion Hierarchy
1. **Fast**: 150ms - Small UI elements (buttons, badges)
2. **Normal**: 300ms - Cards, modals
3. **Slow**: 500ms - Page transitions, complex animations

## 🎯 Accessibility

### Color Contrast
- Ensure text has sufficient contrast against backgrounds
- Use `text-foreground` for maximum contrast
- Use `text-muted-foreground` for secondary text

### Focus States
All interactive elements should have visible focus states:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary"
```

### Icon Usage
Always include descriptive text or aria-labels:
```tsx
<Button aria-label="Delete item">
  <Trash className="w-4 h-4" />
</Button>
```

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens:

```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Stacks on mobile, side-by-side on tablet+ */}
</div>
```

## 🚫 Don'ts

❌ **Don't** use light mode colors
❌ **Don't** mix design systems (stick to Proyon components)
❌ **Don't** use pure white (`#fff`) backgrounds
❌ **Don't** overuse neon-glow (only for primary actions)
❌ **Don't** ignore responsive design
❌ **Don't** forget to add transitions to interactive elements

## ✅ Do's

✅ **Do** use glass morphism for containers
✅ **Do** add subtle animations
✅ **Do** maintain consistent spacing
✅ **Do** use the gradient-text for branding
✅ **Do** ensure accessibility
✅ **Do** test on different screen sizes

## 📚 Component Library

### shadcn/ui Components Installed
- Button
- Card (+ Header, Content, Footer, Title, Description)
- Input
- Textarea
- Scroll Area
- Badge
- Accordion
- Dialog
- Sonner (Toast)

### Custom Proyon Components
- GlassCard
- GradientText
- DesignShowcase (example)

## 🎨 Example Layouts

### Hero Section
```tsx
<div className="flex min-h-screen flex-col items-center justify-center p-8">
  <GradientText as="h1" className="text-6xl font-bold">
    Hero Title
  </GradientText>
  <p className="text-xl text-muted-foreground mt-4">
    Subtitle text
  </p>
  <Button className="neon-glow mt-8">
    Get Started
  </Button>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <GlassCard hover neonBorder>
    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center neon-glow">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mt-4">Feature</h3>
    <p className="text-muted-foreground mt-2">Description</p>
  </GlassCard>
</div>
```

### Form Layout
```tsx
<GlassCard className="max-w-md">
  <h2 className="gradient-text text-2xl font-bold mb-6">
    Form Title
  </h2>
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Label</label>
      <Input placeholder="Enter value..." />
    </div>
    <Button className="neon-glow w-full">
      Submit
    </Button>
  </div>
</GlassCard>
```

---

## 🎯 Quick Reference

**Brand Colors:**
- Primary: `#7c3aed` (Electric Violet)
- Accent: `#22d3ee` (Cyan)
- Gradient: `#7c3aed` → `#d946ef`

**Key Classes:**
- `.gradient-text`
- `.neon-glow`
- `.glass`

**Component Props:**
- `GlassCard`: `hover`, `neonBorder`
- `GradientText`: `as="h1|h2|h3|..."`

**Always:**
- Use dark backgrounds
- Add transitions
- Include icons from Lucide React
- Test responsiveness
- Ensure accessibility

---

**Happy Designing! 🎨**
