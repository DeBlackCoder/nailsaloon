# Requirements Document

## Introduction

This feature enhances the nail tech website's social and chat interactions in two areas:

1. **Twitter-style interaction bar on portfolio works** — replaces the current hidden like/comment UI with a visible, always-on action bar (heart icon + count, comment icon + count) displayed on each work card, matching Twitter's interaction pattern. Comments are publicly visible to all visitors without authentication.

2. **Chat upgrade (ClientChat)** — changes the chat color scheme from green to black/dark, makes the chat window full-screen on mobile (like WhatsApp), and adds support for emoji, sticker, and image sharing in the chat.

---

## Glossary

- **Work_Card**: A portfolio image tile displayed in the Recent Works grid.
- **Interaction_Bar**: The row of action buttons (like, comment) shown on a Work_Card.
- **WorkComments**: The React component that renders the comment thread inside the work detail modal.
- **WorkActionBar**: The React component that renders the like and comment count buttons on a Work_Card.
- **ClientChat**: The React component that provides the real-time chat window for site visitors.
- **Chat_Window**: The floating panel rendered by ClientChat.
- **Chat_Message**: A single message document stored in MongoDB's ChatMessage collection.
- **Sticker**: A WhatsApp-style illustrated sticker from a curated pack of expressive sticker images, sent as a discrete message in the chat. Stickers are distinct from emoji — they are larger, illustrated image assets (not Unicode characters).
- **Emoji_Picker**: A UI panel that lets the user select and insert emoji characters into the chat input.
- **Image_Message**: A Chat_Message whose `type` field is `"image"` and whose `message` field contains a Cloudinary URL pointing to the uploaded image.
- **Like**: A positive reaction recorded against a Work or a WorkComment.
- **Comment_Count**: The total number of WorkComment documents associated with a given work.

---

## Requirements

### Requirement 1: Public Comment Visibility

**User Story:** As a site visitor, I want to read all comments on portfolio works without logging in, so that I can see community reactions before deciding to engage.

#### Acceptance Criteria

1. THE WorkComments SHALL display all comments for a given work to any visitor without requiring authentication.
2. WHEN the work detail modal is opened, THE WorkComments SHALL fetch and render the full comment list immediately.
3. THE WorkComments SHALL display each comment's author name, message text, and relative timestamp.
4. WHEN no comments exist for a work, THE WorkComments SHALL display a "No comments yet. Be the first!" placeholder message.

---

### Requirement 2: Twitter-Style Interaction Bar on Work Cards

**User Story:** As a site visitor, I want to see like and comment counts directly on each portfolio work card, so that I can gauge popularity at a glance without opening the detail modal.

#### Acceptance Criteria

1. THE WorkActionBar SHALL display a heart icon and a numeric like count for each Work_Card.
2. THE WorkActionBar SHALL display a comment bubble icon and a numeric comment count for each Work_Card.
3. WHEN the like count or comment count is zero, THE WorkActionBar SHALL display "0" rather than hiding the count, so the interaction affordance is always visible.
4. WHEN a visitor clicks the heart icon, THE WorkActionBar SHALL increment the like count optimistically and persist the like via `POST /api/works/[id]/like`.
5. WHEN a visitor has already liked a work, THE WorkActionBar SHALL render the heart icon in a filled/active state and SHALL prevent a second like from being submitted. Like deduplication SHALL be tracked using a `liked_work_{workId}` key in localStorage.
6. WHEN a visitor clicks the comment icon, THE WorkActionBar SHALL open the work detail modal and scroll to the comment thread.
7. THE WorkActionBar SHALL be visible on the Work_Card overlay at all times on mobile, and on hover on desktop.

---

### Requirement 3: Twitter-Style Comment Compose and Thread

**User Story:** As a site visitor, I want to post a comment on a portfolio work using a Twitter-style compose box, so that the experience feels familiar and modern.

#### Acceptance Criteria

1. THE WorkComments SHALL render a compose box with a name field and a message field above the comment thread.
2. WHEN the visitor submits the compose form with a non-empty name and message, THE WorkComments SHALL POST the comment to `/api/works/[id]/comments` and prepend the new comment to the thread without a full page reload.
3. IF the POST request fails, THEN THE WorkComments SHALL display an error toast and SHALL NOT add the comment to the thread.
4. WHEN a comment is successfully posted, THE WorkComments SHALL clear the name and message fields.
5. THE WorkComments SHALL display each comment with a colored avatar (initial letter), author name, relative timestamp, message text, and a heart-style like button with count.

---

### Requirement 4: Chat Color Scheme Change (Green → Black)

**User Story:** As a site owner, I want the chat widget to use a black/dark color scheme instead of green, so that it matches the website's brand aesthetic.

#### Acceptance Criteria

1. THE ClientChat SHALL render the FAB button with a black background (`#222222`) instead of the current green (`#25D366`).
2. THE ClientChat SHALL render the Chat_Window header with a black/dark background (`#222222`) instead of the current dark green (`#075E54`).
3. THE ClientChat SHALL render client-sent message bubbles with a dark background (`#222222`) and white text instead of the current green bubble style.
4. THE ClientChat SHALL render all interactive focus rings and accent colors using black/dark tones instead of green.
5. THE ClientChat SHALL preserve the existing WhatsApp-style background pattern but replace the background tint to complement the black theme.

---

### Requirement 5: Full-Screen Chat on Mobile

**User Story:** As a mobile visitor, I want the chat window to take up the full screen width and height, so that I can read and type messages comfortably on a small screen.

#### Acceptance Criteria

1. WHILE the viewport width is less than 640px (mobile breakpoint), THE Chat_Window SHALL occupy 100% of the viewport width and 100% of the viewport height.
2. WHILE the viewport width is less than 640px, THE Chat_Window SHALL be positioned as a fixed overlay covering the full screen (top: 0, left: 0, right: 0, bottom: 0).
3. WHILE the viewport width is less than 640px, THE Chat_Window SHALL hide the FAB button so it does not overlap the full-screen chat.
4. WHILE the viewport width is 640px or wider (desktop), THE Chat_Window SHALL retain its current fixed-position floating panel dimensions and placement.
5. WHEN the visitor closes the Chat_Window on mobile, THE ClientChat SHALL restore the FAB button and return to the default layout.

---

### Requirement 6: Emoji Sharing in Chat

**User Story:** As a site visitor, I want to pick and send emoji in the chat, so that I can express myself more naturally.

#### Acceptance Criteria

1. THE ClientChat SHALL render an emoji picker toggle button adjacent to the chat input field.
2. WHEN the emoji picker toggle is clicked, THE ClientChat SHALL display an Emoji_Picker panel above the input area.
3. WHEN a visitor selects an emoji from the Emoji_Picker, THE ClientChat SHALL insert the emoji character at the current cursor position in the chat input field.
4. WHEN the Emoji_Picker is open and the visitor clicks outside of it, THE ClientChat SHALL close the Emoji_Picker.
5. THE ClientChat SHALL send messages containing emoji characters as standard `"text"` type Chat_Messages.

---

### Requirement 7: Sticker Sharing in Chat

**User Story:** As a site visitor, I want to send pre-defined stickers in the chat, so that I can react expressively with a single tap.

#### Acceptance Criteria

1. THE ClientChat SHALL render a sticker picker toggle button adjacent to the chat input field.
2. WHEN the sticker picker toggle is clicked, THE ClientChat SHALL display a panel of selectable WhatsApp-style illustrated stickers from a curated sticker pack.
3. THE sticker pack SHALL consist of expressive illustrated sticker images (not emoji characters), hosted as static assets or on Cloudinary.
4. WHEN a visitor selects a sticker, THE ClientChat SHALL send a Chat_Message with `type: "sticker"` and the sticker identifier (filename or Cloudinary URL) as the `message` field.
5. WHEN a Chat_Message with `type: "sticker"` is rendered, THE ClientChat SHALL display the sticker as a large illustrated image rather than raw text.
6. THE Chat_Window SHALL display sticker messages from both the client and admin sides with the sticker visual.

---

### Requirement 8: Image Sharing in Chat

**User Story:** As a site visitor, I want to send images in the chat, so that I can share nail inspiration or reference photos with Sofia.

#### Acceptance Criteria

1. THE ClientChat SHALL render an image attachment button adjacent to the chat input field.
2. WHEN the image attachment button is clicked, THE ClientChat SHALL open the device's native file picker filtered to image file types (`image/*`).
3. WHEN the visitor selects an image file, THE ClientChat SHALL display a preview of the selected image above the input field before sending.
4. WHEN the visitor confirms sending, THE ClientChat SHALL upload the image to Cloudinary via the Cloudinary upload API and store the resulting Cloudinary URL as the `message` field of a Chat_Message with `type: "image"`.
5. THE Chat_Message document SHALL store only the Cloudinary URL in the `message` field — no base64 data or binary content SHALL be stored in MongoDB.
6. WHEN a Chat_Message with `type: "image"` is rendered, THE ClientChat SHALL display the image inline within the message bubble using the stored Cloudinary URL.
7. IF the selected image file exceeds 5 MB, THEN THE ClientChat SHALL display an error message and SHALL NOT attempt the Cloudinary upload.
8. THE Chat_Window SHALL display image messages from both the client and admin sides with the inline image rendered.
