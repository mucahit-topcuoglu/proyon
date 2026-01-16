# 🎯 Project Dashboard - Gazla Style

Modern, cyber-professional project dashboard with **interactive timeline**, **AI mentor chat**, and **real-time updates**.

## 🎨 Design Philosophy

Inspired by **[gazla.co](https://gazla.co)** - dark theme, glass morphism, neon accents, and smooth animations.

### Layout Structure:

```
┌─────────────────────────────────────────────────────┐
│ Left Sidebar    │   Center Timeline   │  Right Chat │
│ (Project Info)  │   (Roadmap Steps)   │  (AI Mentor)│
│                 │                      │             │
│ • Title         │   Step 1 ✓          │   💬 Chat   │
│ • Domain Badge  │   Step 2 → (Active) │   Messages  │
│ • Abstract      │   Step 3 ○ (Pending)│   Input     │
│ • Stats         │   Step 4 ○          │             │
│ • Tags          │   ...                │             │
└─────────────────────────────────────────────────────┘
```

## 🚀 Features

### 1. **Project Manifest** (Left Sidebar)

✅ Project title with gradient text
✅ Domain badge (Software, Hardware, Construction, Research)
✅ Status badge (Planning, Active, Completed)
✅ Visibility badge (Public/Private)
✅ Abstract summary
✅ Project description
✅ Stats (total steps, creation date)
✅ Tags
✅ Smooth entrance animations

**Technologies:**
- `framer-motion` for animations
- Custom `GradientText` component
- `Badge` from shadcn/ui

### 2. **Timeline View** (Center)

✅ Vertical stepper with connecting line
✅ **Three states:**
   - ⚪ **Pending** - Grey, opacity 50%
   - 🟣 **In Progress** - Neon purple border, pulse animation
   - 🟢 **Done** - Cyan/green, checkmark icon

✅ **Interactive features:**
   - Click to expand/collapse
   - Shows technical details and rationale
   - Duration estimates vs actual time
   - Priority badges (Normal, High, Critical)

✅ **Action buttons:**
   - ▶️ **Start** (Pending → In Progress)
   - ✅ **Complete** (In Progress → Done)
   - 🚨 **I'm Stuck** (Opens mentor chat with context)

✅ **Completion celebration:**
   - Animated message when all steps are done

**Technologies:**
- `framer-motion` for smooth animations
- `AnimatePresence` for expand/collapse
- Real-time updates via Supabase subscriptions

### 3. **Mentor Chat** (Right Drawer)

✅ AI-powered chat interface
✅ Pre-loads context when "I'm Stuck" is clicked
✅ Shows active roadmap node badge
✅ Message history from Supabase
✅ Typing indicators
✅ Auto-scroll to latest message
✅ **Responsive:**
   - Mobile: Full-screen drawer with backdrop
   - Desktop: Fixed right sidebar

✅ **Keyboard shortcuts:**
   - `Enter` - Send message
   - `Shift+Enter` - New line

**Technologies:**
- Real-time chat history
- Context-aware messaging
- Avatar icons for user/AI

### 4. **Real-Time Updates**

✅ Supabase Realtime subscriptions
✅ Auto-updates when nodes change
✅ Multi-device sync

## 📁 File Structure

```
app/dashboard/projects/[id]/
└── page.tsx                    # Next.js page (Suspense wrapper)

components/dashboard/
├── index.ts                    # Barrel exports
├── project-dashboard.tsx       # Main dashboard component
├── project-dashboard-skeleton.tsx  # Loading skeleton
├── project-manifest.tsx        # Left sidebar (project info)
├── timeline-view.tsx           # Center timeline (roadmap)
└── mentor-chat.tsx             # Right drawer (AI chat)
```

## 🎯 Component API

### ProjectDashboard

```tsx
<ProjectDashboard projectId={string} />
```

**Props:**
- `projectId` - Supabase project UUID

**State:**
- `project` - Project data
- `nodes` - Array of roadmap nodes
- `selectedNode` - Currently selected node (for chat context)
- `chatOpen` - Chat drawer visibility

### ProjectManifest

```tsx
<ProjectManifest 
  project={Project} 
  totalNodes={number} 
/>
```

**Features:**
- Displays project metadata
- Color-coded badges
- Animated entrance

### TimelineView

```tsx
<TimelineView
  nodes={RoadmapNode[]}
  selectedNode={RoadmapNode | null}
  onNodeSelect={(node) => void}
  onStatusUpdate={(id, status) => void}
  onStuck={(node) => void}
/>
```

**Interactions:**
- Click node to expand/collapse
- Action buttons change node status
- "I'm Stuck" opens chat with context

### MentorChat

```tsx
<MentorChat
  projectId={string}
  selectedNode={RoadmapNode | null}
/>
```

**Features:**
- Loads chat history
- Pre-fills input when node selected
- Sends/receives messages
- Auto-scrolls to bottom

## 🎨 Design Tokens

### Node States:

| State | Border | Background | Icon |
|-------|--------|-----------|------|
| Pending | `border-slate-800/50` | `bg-slate-900/30` | `Circle` (grey) |
| In Progress | `border-violet-500` | `bg-violet-500/10` | `Clock` (purple, pulse) |
| Done | `border-cyan-500/50` | `bg-cyan-500/5` | `CheckCircle2` (cyan) |

### Priority Colors:

| Priority | Badge Style |
|----------|------------|
| Normal (0) | `bg-slate-500/20 text-slate-400` |
| High (1) | `bg-orange-500/20 text-orange-400` |
| Critical (2) | `bg-red-500/20 text-red-400` |

### Domain Colors:

| Domain | Badge Style |
|--------|------------|
| Software | `bg-blue-500/20 text-blue-400` |
| Hardware | `bg-orange-500/20 text-orange-400` |
| Construction | `bg-yellow-500/20 text-yellow-400` |
| Research | `bg-purple-500/20 text-purple-400` |

## 🔧 Usage Example

### 1. Navigate to Project Dashboard

```tsx
// In your app
<Link href={`/dashboard/projects/${projectId}`}>
  View Project
</Link>
```

### 2. Dashboard automatically loads:

- Project info from `projects` table
- Roadmap nodes from `roadmap_nodes` table
- Chat history from `mentor_logs` table

### 3. User interactions:

**Start a step:**
```
User clicks "Start" → Status: pending → in_progress
Database updates: started_at timestamp
UI updates: Border turns purple, pulse animation
```

**Complete a step:**
```
User clicks "Complete" → Status: in_progress → done
Database updates: completed_at timestamp, actual_duration
UI updates: Border turns cyan, checkmark icon
```

**Get help:**
```
User clicks "I'm Stuck" → Chat opens
Input pre-fills: "Adım X - Title kısmında takıldım..."
AI context: Knows current step details
```

## ⚡ Performance

### Optimizations:

✅ **Suspense boundaries** - Async data loading
✅ **Skeleton loaders** - Better perceived performance
✅ **Real-time subscriptions** - Only listen to project nodes
✅ **Lazy animations** - Staggered entrance delays
✅ **Auto-cleanup** - Supabase channel removal on unmount

### Bundle Size:

- `framer-motion`: ~60KB gzipped (already installed)
- Dashboard components: ~15KB
- Total: ~75KB additional

## 🐛 Troubleshooting

### Issue: "Proje bulunamadı"

**Cause:** Invalid project ID or RLS policy blocking access

**Fix:**
```sql
-- Check RLS policy in Supabase
SELECT * FROM projects WHERE id = 'your-project-id';
```

### Issue: Real-time updates not working

**Cause:** Supabase Realtime not enabled

**Fix:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for `roadmap_nodes` table

### Issue: Chat messages not saving

**Cause:** Missing `mentor_logs` table or RLS policy

**Fix:**
```sql
-- Run migration if not done
-- Check supabase/migrations/20251218000001_initial_schema.sql
```

## 🚀 Next Steps

### Immediate Enhancements:

1. **AI Integration:**
   - Replace mock AI responses with Google Gemini
   - Use `analyzeIssue` for visual troubleshooting
   - Add streaming responses

2. **Image Upload:**
   - Let users upload photos in chat
   - Send to `analyzeIssue` server action
   - Show analysis in chat

3. **Rich Text Editor:**
   - Add Markdown support to chat
   - Code syntax highlighting
   - File attachments

4. **Progress Tracking:**
   - Add progress bar (% completed)
   - Estimated vs actual time charts
   - Roadmap gantt view

5. **Collaboration:**
   - Multiple users on same project
   - Real-time cursors
   - Comments on nodes

### Advanced Features:

- **Drag & Drop:** Reorder roadmap nodes
- **Templates:** Save successful roadmaps as templates
- **Export:** PDF/Markdown export of roadmap
- **Analytics:** Time tracking, productivity insights
- **Notifications:** Email/Push when node completed

## 📚 Related Documentation

- [`actions/AI-ROADMAP-README.md`](../actions/AI-ROADMAP-README.md) - Auto roadmap generation
- [`actions/VISUAL-TROUBLESHOOTING-README.md`](../actions/VISUAL-TROUBLESHOOTING-README.md) - Image analysis
- [`supabase/DATABASE-README.md`](../supabase/DATABASE-README.md) - Database schema

## ✨ Credits

Design inspired by:
- [gazla.co](https://gazla.co) - Cyber-professional aesthetics
- [Linear](https://linear.app) - Clean timeline UI
- [Vercel](https://vercel.com) - Modern dashboard patterns

---

**Ready to use!** Navigate to `/dashboard/projects/[id]` to see your project dashboard! 🚀
