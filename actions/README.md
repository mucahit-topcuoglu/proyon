# Server Actions

This directory contains Next.js Server Actions for the Proyon platform.

Server Actions allow you to write server-side code that can be called directly from client components.

## Usage Example

```typescript
'use server'

export async function createProject(formData: FormData) {
  // Server-side logic here
  const name = formData.get('name');
  // ... database operations
}
```

## Guidelines

1. Always add `'use server'` directive at the top
2. Use Zod for input validation
3. Handle errors gracefully
4. Return serializable data only
5. Implement proper authentication checks
