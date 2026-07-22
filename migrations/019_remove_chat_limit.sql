-- 019: Remove the 10-message chat cap ("for now" — 2026-07-21).
-- The hard DB CHECK rejected any message_number > 10; drop it so chats can run long.
-- The app-level cap in src/app/api/chat/route.ts is raised to a non-binding value in
-- the same change. NOTE: the chat→'deciding' transition previously fired at 10/10
-- messages, so with the cap effectively removed chats stay 'chatting' (until chat
-- expiry) rather than auto-advancing to the meet-decision step. Revisit when the iOS
-- conversation-flow reconciliation lands (see CONVERSATION_FLOW_RECONCILIATION.md).
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_number_check;
