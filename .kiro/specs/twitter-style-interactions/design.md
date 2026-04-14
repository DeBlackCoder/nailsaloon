# Design Document: Twitter-Style Interactions

## Overview

This feature enhances two areas of the nail tech website:

1. **Work card interaction bar** — replaces the hidden/hover-only like and comment UI with a permanently visible Twitter-style action bar (`WorkActionBar`) showing heart + count and comment bubble + count on every portfolio card.
2. **Chat upgrade** — migrates `ClientChat` from a WhatsApp green theme to a black/dark theme, adds full-screen mobile layout, and introduces emoji picker, sticker picker, and Cloudinary image upload.
3. **Admin chat mobile fix** — migrates `ChatPanel` from a fixed-height desktop layout to a responsive WhatsApp-style mobile layout: full-screen on mobile with a back button to return to the conversation list, black color scheme matching the client chat.

The existing `WorkComments` component already implements most of the Twitter-style thread UI. The changes are additive: surface the `WorkActionBar` unconditionally, fix the zero-count display, and wire the comment icon to open the modal. The `ClientChat` changes are primarily cosmetic (color swap) plus three new input affordances (emoji, sticker, image).

The MongoDB `ChatMessage` model already has the `type: "text" | "image" | "sticker"` field. No schema migration is required — only the client-side rendering and the upload flow need to be added.

---

## Architecture

```mermaid
graph TD
  subgraph "Work Cards"
    RWC[RecentWorksClient] --> WAB[WorkActionBar]
    RWC --> Modal[Work Detail Modal]
    Modal --> WC[WorkComments]
    WAB -->|click comment| Modal
    WAB -->|POST like| LikeAPI["/api/works/[id]/like"]
    WC -->|GET/POST| CommentsAPI["/api/works/[id]/comments"]
    WC -->|PATCH like| CommentAPI["/api/works/[id]/comments/[commentId]"]
  end

  subgraph "Chat"
    CC[ClientChat] -->|GET/POST| ChatAPI["/api/chat"]
    CC -->|upload| Cloudinary[Cloudinary Upload API]
    Cloudinary -->|URL| CC
    CC -->|POST type=image| ChatAPI
    CC -->|POST type=sticker| ChatAPI
    CC -->|POST type=text| ChatAPI
  end

  subgraph "Storage"
    LikeAPI --> MongoDB[(MongoDB)]
    CommentsAPI --> MongoDB
    ChatAPI --> MongoDB
    LS[localStorage] -.->|liked_work_{id}| WAB
    LS -.->|liked_comment_{id}| WC
  end
```

The architecture is intentionally flat — no new server-side services, no new database collections. All changes are in existing components and routes.

---

## Components and Interfaces

### WorkActionBar

Already exists in `components/WorkComments.tsx` as a named export. The current implementation hides counts when zero. The change: always show `"0"` when count is zero.

```typescript
// Props — unchanged
interface WorkActionBarProps {
  workId: string;
  onCommentClick: () => void;
}
```

Behavior changes:
- Like count: render `likes` (not `likes > 0 ? likes : ""`), so zero shows as `"0"`.
- Comment count: same — always render the numeric value.
- The heart icon uses `liked_work_{workId}` in localStorage for deduplication (already implemented).

### WorkComments

Already exists in `components/WorkComments.tsx`. No structural changes needed — the component already implements the Twitter-style thread, compose box, avatar, like button, and admin reply. The design confirms the existing implementation satisfies Requirements 1 and 3.

### RecentWorksClient

`components/RecentWorksClient.tsx` needs to:
1. Import and render `WorkActionBar` on each card overlay (currently it does not render it).
2. Pass `onCommentClick` that sets `selected` to the work and scrolls to comments.

```typescript
// New prop on the card overlay div
<WorkActionBar
  workId={work._id}
  onCommentClick={() => setSelected(work)}
/>
```

The `WorkActionBar` is placed inside the existing gradient overlay div at the bottom of each card, alongside the title/description.

### ClientChat — Color Scheme

All green tokens replaced with black/dark equivalents:

| Old value | New value | Usage |
|-----------|-----------|-------|
| `#25D366` | `#222222` | FAB background |
| `#075E54` | `#222222` | Header background |
| `#DCF8C6` | `#222222` | Client bubble background |
| `text-[#222]` on client bubble | `text-white` | Client bubble text |
| `focus:ring-[#25D366]` | `focus:ring-[#222222]` | Input focus ring |
| `bg-[#25D366]` send button | `bg-[#222222]` | Send button |
| `hover:bg-[#1ebe5d]` | `hover:bg-[#444444]` | Send button hover |

The WhatsApp background pattern SVG is retained; the background color changes from `#ECE5DD` to `#1a1a1a` (dark) to complement the black theme.

### ClientChat — Full-Screen Mobile

The chat window `div` gains responsive Tailwind classes:

```
// Mobile: fixed full-screen overlay
// Desktop: existing floating panel (bottom-44 right-6, w-[340px], h-[480px])
className="
  fixed z-50 flex flex-col overflow-hidden shadow-2xl border border-[#333]
  // mobile
  inset-0 rounded-none
  // desktop (sm+)
  sm:inset-auto sm:bottom-44 sm:right-6 sm:w-[340px] sm:h-[480px] sm:rounded-[16px]
"
```

The FAB button gains `sm:flex hidden` → `hidden sm:flex` logic: on mobile it is hidden when the chat is open (the full-screen window replaces it). When closed, the FAB is always visible.

```typescript
// FAB visibility
className={`fixed bottom-24 right-6 z-50 ... ${open ? "hidden sm:flex" : "flex"}`}
```

### ClientChat — Emoji Picker

A lightweight emoji picker is added using the `emoji-mart` library (`@emoji-mart/react` + `@emoji-mart/data`). This is the standard choice for React emoji pickers and avoids building one from scratch.

```typescript
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

// State
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);

// Insert at cursor
const handleEmojiSelect = (emoji: { native: string }) => {
  const el = inputRef.current;
  if (!el) return;
  const start = el.selectionStart ?? input.length;
  const end = el.selectionEnd ?? input.length;
  const newVal = input.slice(0, start) + emoji.native + input.slice(end);
  setInput(newVal);
  // Restore cursor after emoji
  requestAnimationFrame(() => {
    el.setSelectionRange(start + emoji.native.length, start + emoji.native.length);
    el.focus();
  });
  setShowEmojiPicker(false);
};
```

The picker panel is rendered above the input bar, positioned absolutely. A `useEffect` with a `mousedown` listener on `document` closes it when clicking outside (standard pattern).

Emoji messages are sent with `type: "text"` — no API change needed.

### ClientChat — Sticker Picker

Stickers are a curated set of illustrated images. They are stored as static assets in `public/stickers/` (see Sticker Asset Strategy below). The sticker picker is a custom grid panel — no third-party library needed.

```typescript
// Sticker definition
interface Sticker {
  id: string;       // e.g. "heart-eyes"
  src: string;      // e.g. "/stickers/heart-eyes.webp"
  alt: string;
}

const STICKERS: Sticker[] = [
  { id: "heart-eyes",  src: "/stickers/heart-eyes.webp",  alt: "Heart eyes" },
  { id: "sparkles",    src: "/stickers/sparkles.webp",    alt: "Sparkles" },
  { id: "nail-polish", src: "/stickers/nail-polish.webp", alt: "Nail polish" },
  // ... up to ~12 stickers
];

// Send sticker
const handleStickerSelect = async (sticker: Sticker) => {
  setShowStickerPicker(false);
  await sendMessage({ message: sticker.src, type: "sticker" });
};
```

Sticker messages store the `/stickers/{id}.webp` path as the `message` field. When rendered, an `<img>` tag is used instead of a text node.

### ClientChat — Image Upload

Image upload flow:

1. Hidden `<input type="file" accept="image/*" ref={fileInputRef} />` triggered by the attachment button.
2. On file selection: validate size ≤ 5 MB, generate a local `URL.createObjectURL` preview.
3. On send: upload to Cloudinary via the unsigned upload API, get back the `secure_url`.
4. POST to `/api/chat` with `{ type: "image", message: cloudinaryUrl }`.

```typescript
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const uploadToCloudinary = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url as string;
};
```

State additions to `ClientChat`:

```typescript
const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
const [uploading, setUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### Message Rendering

The existing message rendering loop needs to branch on `type`:

```typescript
// In the messages map
{m.type === "sticker" ? (
  <img src={m.message} alt="sticker" className="w-24 h-24 object-contain" />
) : m.type === "image" ? (
  <img src={m.message} alt="shared image" className="max-w-full rounded-lg max-h-48 object-cover" />
) : (
  <p className="leading-relaxed">{m.message}</p>
)}
```

The `Msg` interface in `ClientChat` gains the `type` field:

```typescript
interface Msg {
  _id: string;
  message: string;
  type: "text" | "image" | "sticker";
  sender: "client" | "admin";
  createdAt: string;
}
```

---

### AdminChatPanel — Mobile WhatsApp Layout

The `ChatPanel` component currently uses a fixed `h-[600px]` desktop layout with a sidebar + chat area side by side. On mobile this breaks — the sidebar is too narrow and the chat area is unusable.

**Changes:**

1. Remove fixed `h-[600px]` — use `h-full` or `min-h-screen` on mobile
2. On mobile (`< sm`): show either the conversation list OR the chat area (not both side by side) — like WhatsApp mobile
3. Add a back button (`←`) in the chat header on mobile to return to the conversation list
4. Replace all green tokens with black/dark equivalents (same table as ClientChat)
5. Add emoji picker and image/sticker support (same as ClientChat) — admin can also send stickers and images

```typescript
// Mobile: show list or chat based on `selected` state
// Desktop: side-by-side layout retained

// Sidebar visibility
className={`
  w-full sm:w-72 flex-shrink-0 border-r border-[#333] flex flex-col
  ${selected ? "hidden sm:flex" : "flex"}
`}

// Chat area visibility  
className={`
  flex-1 flex flex-col
  ${!selected ? "hidden sm:flex" : "flex"}
`}

// Back button in chat header (mobile only)
<button onClick={() => setSelected(null)} className="sm:hidden mr-2 text-white">
  ← 
</button>
```

Color token replacements for `ChatPanel`:

| Old value | New value | Usage |
|-----------|-----------|-------|
| `bg-[#075E54]` | `bg-[#222222]` | Sidebar header |
| `bg-[#25D366]` | `bg-[#222222]` | Unread badge, send button |
| `hover:bg-[#1ebe5d]` | `hover:bg-[#444444]` | Send button hover |
| `focus:ring-[#25D366]` | `focus:ring-[#222222]` | Input focus ring |
| `bg-[#DCF8C6]` | `bg-[#222222] text-white` | Admin message bubble |
| `text-[#25D366]` (online dot) | `text-[#aaaaaa]` | Online indicator |
| `bg-[#F0F2F5]` | `bg-[#1a1a1a]` | Chat background |
| `bg-[#F0F0F0]` | `bg-[#111111]` | Input bar background |
| `#ECE5DD` pattern bg | `#1a1a1a` | Messages area background |

---

### ChatMessage (existing — no migration needed)

```typescript
// models/ChatMessage.ts — already correct
{
  clientId:   String,   // required, indexed
  clientName: String,   // required
  message:    String,   // required — text content, sticker path, or Cloudinary URL
  type:       "text" | "image" | "sticker",  // default: "text"
  sender:     "client" | "admin",
  read:       Boolean,
  createdAt:  Date,
}
```

The `type` field already exists in the schema. No schema change is needed.

### RecentWork (existing — no migration needed)

```typescript
// models/RecentWork.ts — already correct
{
  title:       String,
  description: String,
  imageUrl:    String,
  serviceType: String,
  price:       String,
  likes:       Number,  // work-level like count
  createdAt:   Date,
}
```

### WorkComment (existing — no migration needed)

```typescript
// models/WorkComment.ts — already correct
{
  workId:     String,   // indexed
  name:       String,
  message:    String,
  likes:      Number,
  adminReply: String,
  createdAt:  Date,
}
```

No new collections or schema changes are required for this feature.

---

## API Routes

All required API routes already exist. The table below confirms coverage:

| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/api/works/[id]/like` | POST | Increment work like count | ✅ exists |
| `/api/works/[id]/comments` | GET | Fetch comment list | ✅ exists |
| `/api/works/[id]/comments` | POST | Create new comment | ✅ exists |
| `/api/works/[id]/comments/[commentId]` | PATCH | Like a comment / admin reply | ✅ exists |
| `/api/works/[id]/comments/[commentId]` | DELETE | Admin delete comment | ✅ exists |
| `/api/chat` | GET | Fetch messages for client | ✅ exists |
| `/api/chat` | POST | Send a message (text/image/sticker) | ✅ exists |

The `/api/chat` POST route already accepts and stores the `type` field. No API changes are needed.

### Cloudinary Upload

Image upload goes directly from the browser to Cloudinary's unsigned upload endpoint — it does not pass through the Next.js API. This keeps the API route simple and avoids streaming large files through the server.

#### Setup Steps

1. **Create a Cloudinary account** at [cloudinary.com](https://cloudinary.com) (free tier is sufficient).
2. **Create an unsigned upload preset**:
   - Go to Settings → Upload → Upload presets → Add upload preset
   - Set "Signing mode" to **Unsigned**
   - Optionally set a folder (e.g. `chat-images`) to keep uploads organized
   - Save and copy the preset name
3. **Copy your Cloud Name** from the Cloudinary dashboard (top-left).
4. **Add env vars** to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

5. **Install the package** — we use `next-cloudinary` for the `CldImage` component (optimized delivery) and the raw Cloudinary REST API for uploads:

```bash
npm install next-cloudinary
```

6. **Configure `next.config.ts`** to allow Cloudinary image domains:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};
```

#### Upload Implementation

The upload is a direct `fetch` to Cloudinary's REST endpoint — no server-side proxy needed:

```typescript
const uploadToCloudinary = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url as string; // HTTPS URL stored in MongoDB
};
```

Rendered images use Next.js `<Image>` (or `CldImage` from `next-cloudinary`) for automatic optimization:

```typescript
import { CldImage } from "next-cloudinary";
// or standard Next.js Image for simple cases
import Image from "next/image";
```

---

## Sticker Asset Strategy

Stickers are stored as static WebP images in `public/stickers/`. This avoids Cloudinary costs for static assets and keeps the sticker pack version-controlled alongside the code.

Recommended initial pack (12 stickers, nail/beauty themed):

```
public/stickers/
  heart-eyes.webp
  sparkles.webp
  nail-polish.webp
  fire.webp
  crown.webp
  rainbow.webp
  star-struck.webp
  clapping.webp
  love-letter.webp
  butterfly.webp
  cherry-blossom.webp
  100.webp
```

Each sticker is a 256×256 WebP, ≤ 50 KB. The `message` field for sticker Chat_Messages stores the absolute path `/stickers/{id}.webp`, which Next.js serves from `public/`.

If the sticker pack needs to grow or be managed dynamically in the future, the `src` values can be migrated to Cloudinary URLs without any schema change — the `message` field is already a string.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Comment rendering completeness

*For any* array of WorkComment objects, rendering the `WorkComments` component should produce output that contains each comment's author name, message text, and a timestamp string — and a like button with a count.

**Validates: Requirements 1.3, 3.5**

---

### Property 2: WorkActionBar always shows counts

*For any* work with any non-negative like count and any non-negative comment count (including zero), the rendered `WorkActionBar` should display both a heart icon and a comment icon, each accompanied by a numeric count string (including `"0"`).

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 3: Like deduplication via localStorage

*For any* workId, if `localStorage` contains the key `liked_work_{workId}`, then the heart icon should be rendered in the filled/active state and clicking it should not trigger a POST to `/api/works/[id]/like`.

**Validates: Requirements 2.5**

---

### Property 4: Comment submission round-trip

*For any* non-empty name string and non-empty message string, submitting the compose form should call `POST /api/works/[id]/comments` and the new comment should appear at the top of the rendered thread.

**Validates: Requirements 3.2**

---

### Property 5: Failed POST leaves thread unchanged

*For any* name and message, if the POST to `/api/works/[id]/comments` returns an error response, the comment list length should be unchanged and an error toast should be displayed.

**Validates: Requirements 3.3**

---

### Property 6: Successful post clears fields

*For any* valid name and message, after a successful POST, both the name input field and the message input field should be empty strings.

**Validates: Requirements 3.4**

---

### Property 7: Client message bubbles use dark theme

*For any* Chat_Message with `sender: "client"`, the rendered message bubble should have a dark background class (`bg-[#222222]`) and white text class (`text-white`).

**Validates: Requirements 4.3**

---

### Property 8: Emoji inserted at cursor position

*For any* input string, cursor position within that string, and emoji character, selecting the emoji from the picker should insert it at the cursor position, producing `input.slice(0, cursor) + emoji + input.slice(cursor)`.

**Validates: Requirements 6.3**

---

### Property 9: Emoji messages sent as type "text"

*For any* message string containing one or more emoji characters, the Chat_Message created by sending it should have `type: "text"`.

**Validates: Requirements 6.5**

---

### Property 10: Sticker selection sends correct type and identifier

*For any* sticker in the sticker pack, selecting it should send a Chat_Message with `type: "sticker"` and `message` equal to the sticker's `src` path.

**Validates: Requirements 7.4**

---

### Property 11: Sticker messages render as images, not text

*For any* Chat_Message with `type: "sticker"`, the rendered message bubble should contain an `<img>` element with the sticker `src` as its `src` attribute, and should not render the raw path string as visible text.

**Validates: Requirements 7.5, 7.6**

---

### Property 12: Image upload stores Cloudinary URL

*For any* valid image file (mocked Cloudinary returning a URL), the Chat_Message created should have `type: "image"` and `message` equal to the mocked Cloudinary `secure_url` — not a base64 string or local object URL.

**Validates: Requirements 8.4, 8.5**

---

### Property 13: Oversized images are rejected before upload

*For any* file with `size > 5 * 1024 * 1024` bytes, the Cloudinary upload function should never be called and an error message should be displayed to the user.

**Validates: Requirements 8.7**

---

### Property 14: Image messages render inline

*For any* Chat_Message with `type: "image"` and a Cloudinary URL as `message`, the rendered bubble should contain an `<img>` element with that URL as its `src` attribute.

**Validates: Requirements 8.6, 8.8**

---

## Error Handling

### Image Upload Errors

| Condition | Handling |
|-----------|----------|
| File > 5 MB | Client-side check before upload; show error toast; do not call Cloudinary |
| Cloudinary upload fails (network/API error) | Catch in `uploadToCloudinary`; show error toast; do not POST to `/api/chat` |
| Cloudinary returns non-OK response | Same as above |
| File picker cancelled | `fileInputRef.current.value = ""`, clear `pendingImage` state |

### Chat Message Errors

| Condition | Handling |
|-----------|----------|
| POST `/api/chat` fails | Show error toast; remove optimistic message from state |
| DB connection error | API returns 500; client shows error toast |

### Work Comment Errors

| Condition | Handling |
|-----------|----------|
| POST `/api/works/[id]/comments` fails | Show error toast via `sonner`; do not prepend comment |
| Like PATCH fails | Silently ignore (optimistic update already applied) |
| Work not found on like POST | API returns 404; client ignores (like count stays optimistic) |

### Emoji / Sticker Picker

- If `@emoji-mart/data` fails to load, the picker renders empty — no crash.
- If a sticker image 404s, the `<img>` renders with `alt` text — no crash.

---

## Testing Strategy

### Unit Tests (example-based)

Focus on specific behaviors and edge cases:

- `WorkActionBar` renders with zero counts showing `"0"` (not empty)
- `WorkActionBar` heart is filled when `liked_work_{id}` is in localStorage
- `WorkComments` shows placeholder when comment array is empty
- `WorkComments` compose form is present above the thread
- `ClientChat` FAB has `bg-[#222222]` class
- `ClientChat` emoji toggle button is present when chat is open
- `ClientChat` sticker toggle button is present when chat is open
- `ClientChat` image attachment button is present when chat is open
- `ClientChat` shows image preview after file selection
- `ClientChat` closes emoji picker on outside click
- `ClientChat` FAB is hidden on mobile when chat is open (class check)

### Property-Based Tests

Use **fast-check** (TypeScript-native, works with Vitest/Jest). Each property test runs a minimum of 100 iterations.

```typescript
// Tag format: Feature: twitter-style-interactions, Property N: <property_text>
```

| Property | Generator inputs | Assertion |
|----------|-----------------|-----------|
| P1: Comment rendering completeness | `fc.array(fc.record({ name: fc.string(), message: fc.string(), createdAt: fc.date() }))` | Each name, message, timestamp present in output |
| P2: WorkActionBar always shows counts | `fc.integer({ min: 0 }), fc.integer({ min: 0 })` for likes/comments | Both counts rendered as strings including "0" |
| P3: Like deduplication | `fc.string()` for workId | With localStorage key set, heart is filled, POST not called |
| P4: Comment submission round-trip | `fc.string({ minLength: 1 }), fc.string({ minLength: 1 })` | POST called, new comment at top of list |
| P5: Failed POST leaves thread unchanged | `fc.string({ minLength: 1 }), fc.string({ minLength: 1 })` | List length unchanged, toast shown |
| P6: Successful post clears fields | `fc.string({ minLength: 1 }), fc.string({ minLength: 1 })` | Both fields empty after success |
| P7: Client bubbles dark theme | `fc.record({ message: fc.string(), sender: fc.constant("client"), type: fc.constant("text") })` | Dark bg + white text classes present |
| P8: Emoji inserted at cursor | `fc.string(), fc.nat(), fc.string({ minLength: 1, maxLength: 2 })` for input/cursor/emoji | Output equals `input.slice(0,cursor)+emoji+input.slice(cursor)` |
| P9: Emoji messages type "text" | `fc.string()` with emoji appended | Sent message has `type: "text"` |
| P10: Sticker sends correct type/id | `fc.constantFrom(...STICKERS)` | Sent message has `type: "sticker"`, `message === sticker.src` |
| P11: Sticker renders as image | `fc.constantFrom(...STICKERS)` for `message`, `fc.constantFrom("client","admin")` for sender | `<img src={sticker.src}>` present, raw path not visible as text |
| P12: Image upload stores URL | Mock Cloudinary returning `fc.webUrl()` | `type: "image"`, `message === mockUrl`, not base64 |
| P13: Oversized images rejected | `fc.integer({ min: 5*1024*1024+1 })` for file size | Upload function never called, error shown |
| P14: Image messages render inline | `fc.webUrl()` for message, `fc.constantFrom("client","admin")` for sender | `<img src={url}>` present in bubble |

### Integration Tests

- `GET /api/works/[id]/comments` returns array for valid workId
- `POST /api/works/[id]/comments` creates and returns comment document
- `POST /api/works/[id]/like` increments `likes` field on RecentWork
- `POST /api/chat` with `type: "sticker"` stores document with correct type
- `POST /api/chat` with `type: "image"` stores document with Cloudinary URL

### Dependencies to Install

```bash
npm install @emoji-mart/react @emoji-mart/data next-cloudinary
npm install --save-dev fast-check
```

Sticker images are static assets in `public/stickers/` — no additional library needed for stickers.
