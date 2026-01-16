# Proyon Custom Components

This directory contains custom UI components for the Proyon platform.

## Design Principles

- **Cyber-Professional Aesthetic**: Dark mode with neon accents
- **Glass Morphism**: Translucent cards with backdrop blur
- **Neon Accents**: Electric violet (#7c3aed) to neon fuchsia (#d946ef) gradients
- **Action Colors**: Cyan (#22d3ee) for interactive elements

## Component Guidelines

1. All components should follow the design system defined in `globals.css`
2. Use Tailwind utility classes for styling
3. Leverage the gradient-text, neon-glow, and glass utility classes
4. Ensure components are accessible and responsive
5. Use Lucide React for icons

## Examples

```tsx
// Glass card with neon border
<div className="glass rounded-lg p-6">
  <h2 className="gradient-text text-2xl font-bold">Title</h2>
</div>

// Button with neon glow
<Button className="neon-glow bg-primary">Click Me</Button>
```
