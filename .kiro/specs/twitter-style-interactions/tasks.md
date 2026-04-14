# Implementation Plan: Twitter-Style Interactions

## Overview

Incremental implementation of the Twitter-style work card interaction bar, public comment visibility, ClientChat dark theme + full-screen mobile + emoji/sticker/image support, and Admin ChatPanel mobile WhatsApp layout + dark theme. All API routes and MongoDB schemas are already in place — changes are purely client-side components plus environment/config wiring.

## Tasks

- [x] 1. Install dependencies and configure environment
  - Run `npm install @emoji-mart/react @emoji-mart/data next-cloudinary` and `npm install --save-dev fast-check`
  - Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name` as placeholder entries to `.env.local`
  - Update `next.config.ts` to add `res.cloudinary.com` to `images.remotePatterns`
  - _Requirements: 8.4_

- [x] 2. Fix WorkActionBar zero-count display and wire it into RecentWorksClient
  - [x] 2.1 Update `WorkActionBar` in `components/WorkComments.tsx` to always render the numeric count (show `"0"` instead of empty string when count is zero) for both likes and comments
    - Change `likes > 0 ? likes : ""` → `likes` and `commentCount > 0 ? commentCount : ""` → `commentCount` in the two `<span>` elements
    - Also fix the `WorkActionBar` likes fetch: currently it sums comment likes instead of reading the work-level `likes` field — fetch `GET /api/works/[id]` (or use the existing like count from the work object) to get the correct work-level like count
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Import and render `WorkActionBar` inside `components/RecentWorksClient.tsx` on each card overlay
    - Place `<WorkActionBar workId={work._id} onCommentClick={() => setSelected(work)} />` inside the gradient overlay div, below the title/description/badge
    - _Requirements: 2.6, 2.7_
  - [ ]* 2.3 Write property test for WorkActionBar always-shows-counts (Property 2)
    - **Property 2: WorkActionBar always shows counts**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Use `fc.integer({ min: 0 })` for likes and commentCount; assert both numeric strings (including `"0"`) are present in rendered output
  - [ ]* 2.4 Write property test for like deduplication via localStorage (Property 3)
    - **Property 3: Like deduplication via localStorage**
    - **Validates: Requirements 2.5**
    - Use `fc.string()` for workId; with `liked_work_{workId}` set in localStorage, assert heart is filled and POST is not called

- [x] 3. Ensure public comment visibility and placeholder in WorkComments
  - Verify `WorkComments` renders without any auth guard (it already does — confirm no conditional rendering blocks the thread for unauthenticated visitors)
  - Confirm the empty-state placeholder `"No comments yet. Be the first!"` is present (already in code — no change needed if confirmed)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 3.1 Write property test for comment rendering completeness (Property 1)
    - **Property 1: Comment rendering completeness**
    - **Validates: Requirements 1.3, 3.5**
    - Use `fc.array(fc.record({ _id: fc.string(), name: fc.string({ minLength: 1 }), message: fc.string({ minLength: 1 }), createdAt: fc.date().map(d => d.toISOString()), likes: fc.integer({ min: 0 }) }))` and assert each name, message, and timestamp string appears in rendered output
  - [ ]* 3.2 Write property test for comment submission round-trip (Property 4)
    - **Property 4: Comment submission round-trip**
    - **Validates: Requirements 3.2**
    - Use `fc.string({ minLength: 1 })` for name and message; mock successful POST; assert new comment appears at top of thread
  - [ ]* 3.3 Write property test for failed POST leaves thread unchanged (Property 5)
    - **Property 5: Failed POST leaves thread unchanged**
    - **Validates: Requirements 3.3**
    - Mock POST returning error; assert comment list length unchanged and error toast shown
  - [ ]* 3.4 Write property test for successful post clears fields (Property 6)
    - **Property 6: Successful post clears fields**
    - **Validates: Requirements 3.4**
    - Mock successful POST; assert name and message inputs are empty strings after submission

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Migrate ClientChat color scheme from green to black
  - In `components/ClientChat.tsx`, replace all green color tokens with black/dark equivalents:
    - FAB: `bg-[#25D366]` → `bg-[#222222]`, `hover:bg-[#1ebe5d]` → `hover:bg-[#444444]`
    - Header: `bg-[#075E54]` → `bg-[#222222]`; header icon circle: `bg-[#25D366]` → `bg-[#333333]`
    - Client bubble: `bg-[#DCF8C6] text-[#222]` → `bg-[#222222] text-white`
    - Input focus ring: `focus:ring-[#25D366]` → `focus:ring-[#222222]`
    - Send button: `bg-[#25D366]` → `bg-[#222222]`, `hover:bg-[#1ebe5d]` → `hover:bg-[#444444]`
    - Messages area background: `#ECE5DD` → `#1a1a1a`
    - Registration form accent: `text-[#075E54]` → `text-[#222222]`; button green → `bg-[#222222]`; input ring → `focus:ring-[#222222]`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 5.1 Write property test for client message bubbles dark theme (Property 7)
    - **Property 7: Client message bubbles use dark theme**
    - **Validates: Requirements 4.3**
    - Use `fc.record({ message: fc.string(), sender: fc.constant("client"), type: fc.constant("text") })`; assert `bg-[#222222]` and `text-white` classes present on rendered bubble

- [x] 6. Implement ClientChat full-screen mobile layout
  - Replace the fixed `bottom-44 right-6 w-[340px] h-[480px]` chat window div with responsive Tailwind classes:
    - Mobile: `inset-0 rounded-none` (full-screen overlay)
    - Desktop (`sm:`): `sm:inset-auto sm:bottom-44 sm:right-6 sm:w-[340px] sm:h-[480px] sm:rounded-[16px]`
  - Update FAB visibility: when `open` is true, add `hidden sm:flex` so FAB is hidden on mobile but visible on desktop; when `open` is false, keep `flex`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Add emoji picker to ClientChat
  - Add `showEmojiPicker` state (`useState(false)`) and `inputRef` (`useRef<HTMLInputElement>`)
  - Add emoji toggle button (😊 icon) in the input bar, left of the text input
  - Render `<Picker data={data} onEmojiSelect={handleEmojiSelect} />` from `@emoji-mart/react` above the input bar when `showEmojiPicker` is true
  - Implement `handleEmojiSelect` to insert `emoji.native` at cursor position using `inputRef.current.selectionStart/End`
  - Add `useEffect` with `mousedown` listener on `document` to close picker on outside click
  - Attach `ref={inputRef}` to the text `<input>`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 7.1 Write property test for emoji inserted at cursor position (Property 8)
    - **Property 8: Emoji inserted at cursor position**
    - **Validates: Requirements 6.3**
    - Use `fc.string()` for input, `fc.nat()` for cursor (clamped to string length), `fc.string({ minLength: 1, maxLength: 2 })` for emoji; assert result equals `input.slice(0, cursor) + emoji + input.slice(cursor)`
  - [ ]* 7.2 Write property test for emoji messages sent as type "text" (Property 9)
    - **Property 9: Emoji messages sent as type "text"**
    - **Validates: Requirements 6.5**
    - Use `fc.string()` with emoji appended; mock POST; assert sent body has `type: "text"`

- [x] 8. Add sticker picker to ClientChat
  - Create `STICKERS` constant array with 12 nail/beauty-themed sticker definitions (`{ id, src, alt }`) referencing `/stickers/*.webp` paths
  - Create placeholder WebP sticker files in `public/stickers/` (12 files: `heart-eyes.webp`, `sparkles.webp`, `nail-polish.webp`, `fire.webp`, `crown.webp`, `rainbow.webp`, `star-struck.webp`, `clapping.webp`, `love-letter.webp`, `butterfly.webp`, `cherry-blossom.webp`, `100.webp`) — use 1×1 transparent WebP as placeholder if real assets are not yet available
  - Add `showStickerPicker` state and sticker toggle button (🎭 or sticker icon) in the input bar
  - Render sticker grid panel above input bar when `showStickerPicker` is true; each sticker is a clickable `<img>`
  - Implement `handleStickerSelect` to call `sendMessage({ message: sticker.src, type: "sticker" })` and close picker
  - Refactor the existing `handleSend` into a reusable `sendMessage({ message, type })` helper to support text, sticker, and image sends
  - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 8.1 Write property test for sticker selection sends correct type and identifier (Property 10)
    - **Property 10: Sticker selection sends correct type and identifier**
    - **Validates: Requirements 7.4**
    - Use `fc.constantFrom(...STICKERS)`; mock POST; assert sent body has `type: "sticker"` and `message === sticker.src`

- [x] 9. Add message rendering for sticker and image types in ClientChat
  - Update the `Msg` interface in `ClientChat` to add `type: "text" | "image" | "sticker"`
  - In the messages render loop, branch on `m.type`:
    - `"sticker"`: render `<img src={m.message} alt="sticker" className="w-24 h-24 object-contain" />`
    - `"image"`: render `<img src={m.message} alt="shared image" className="max-w-full rounded-lg max-h-48 object-cover" />`
    - `"text"` (default): render `<p className="leading-relaxed">{m.message}</p>`
  - _Requirements: 7.5, 7.6, 8.6, 8.8_
  - [ ]* 9.1 Write property test for sticker messages render as images (Property 11)
    - **Property 11: Sticker messages render as images, not text**
    - **Validates: Requirements 7.5, 7.6**
    - Use `fc.constantFrom(...STICKERS)` for message, `fc.constantFrom("client","admin")` for sender; assert `<img>` with correct `src` is present and raw path string is not rendered as visible text
  - [ ]* 9.2 Write property test for image messages render inline (Property 14)
    - **Property 14: Image messages render inline**
    - **Validates: Requirements 8.6, 8.8**
    - Use `fc.webUrl()` for message, `fc.constantFrom("client","admin")` for sender; assert `<img src={url}>` is present in rendered bubble

- [x] 10. Add image upload to ClientChat
  - Add `pendingImage` state (`{ file: File; preview: string } | null`), `uploading` state, and `fileInputRef` (`useRef<HTMLInputElement>`)
  - Add hidden `<input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} />`
  - Add attachment button (📎 icon) in the input bar that calls `fileInputRef.current?.click()`
  - Implement `handleFileSelect`: validate `file.size <= 5 * 1024 * 1024`, generate `URL.createObjectURL(file)` preview, set `pendingImage`; show error toast if oversized
  - Render image preview above input bar when `pendingImage` is set, with a cancel (×) button to clear it
  - Implement `uploadToCloudinary(file)` using direct `fetch` to `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload` with `upload_preset`
  - On send with `pendingImage`: call `uploadToCloudinary`, then `sendMessage({ message: secureUrl, type: "image" })`; show error toast on upload failure
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7_
  - [ ]* 10.1 Write property test for image upload stores Cloudinary URL (Property 12)
    - **Property 12: Image upload stores Cloudinary URL**
    - **Validates: Requirements 8.4, 8.5**
    - Mock Cloudinary returning `fc.webUrl()`; assert sent Chat_Message has `type: "image"` and `message === mockUrl` (not base64 or object URL)
  - [ ]* 10.2 Write property test for oversized images rejected before upload (Property 13)
    - **Property 13: Oversized images rejected before upload**
    - **Validates: Requirements 8.7**
    - Use `fc.integer({ min: 5 * 1024 * 1024 + 1 })` for file size; assert Cloudinary upload function is never called and error toast is shown

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Migrate AdminChatPanel color scheme from green to black
  - In `components/admin/ChatPanel.tsx`, replace all green color tokens with black/dark equivalents:
    - Sidebar header: `bg-[#075E54]` → `bg-[#222222]`
    - Unread badge: `bg-[#25D366]` → `bg-[#222222]`
    - Send button: `bg-[#25D366]` → `bg-[#222222]`, `hover:bg-[#1ebe5d]` → `hover:bg-[#444444]`
    - Input focus ring: `focus:ring-[#25D366]` → `focus:ring-[#222222]`
    - Admin message bubble: `bg-[#DCF8C6] text-[#222]` → `bg-[#222222] text-white`
    - Online dot: `text-[#25D366]` → `text-[#aaaaaa]`
    - Chat background: `#ECE5DD` → `#1a1a1a`
    - Input bar: `bg-[#F0F0F0]` → `bg-[#111111]`
    - Chat header: `bg-[#F0F2F5]` → `bg-[#1a1a1a]`
    - Empty state: `bg-[#F0F2F5]` → `bg-[#1a1a1a]`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 13. Implement AdminChatPanel WhatsApp-style mobile layout
  - Remove fixed `h-[600px]` from the outer container; replace with `h-full min-h-[600px]` so it fills the admin panel area
  - Make the sidebar conditionally visible on mobile: add `${selected ? "hidden sm:flex" : "flex"}` to the sidebar div's className
  - Make the chat area conditionally visible on mobile: add `${!selected ? "hidden sm:flex" : "flex"}` to the chat area div's className
  - Add a back button in the chat header (mobile only): `<button onClick={() => setSelected(null)} className="sm:hidden mr-2 text-white">←</button>`
  - Update the `Msg` interface in `ChatPanel` to include `type: "text" | "image" | "sticker"` and update message rendering to branch on type (same pattern as ClientChat task 9)
  - _Requirements: (Admin ChatPanel mobile fix — design section "AdminChatPanel — Mobile WhatsApp Layout")_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
