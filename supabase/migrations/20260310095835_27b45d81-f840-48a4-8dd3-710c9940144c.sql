
-- Fix: Remove overly permissive guest chat policies
-- Guest chats are managed server-side via service role, no client-side anon access needed

-- chat_conversations: restrict to authenticated users only
DROP POLICY IF EXISTS "Users can manage own chat conversations" ON public.chat_conversations;
CREATE POLICY "Authenticated users manage own conversations"
ON public.chat_conversations FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- chat_messages: restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.chat_messages;
CREATE POLICY "Authenticated users access own messages"
ON public.chat_messages FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM chat_conversations
  WHERE id = chat_messages.conversation_id AND user_id = auth.uid()
)) WITH CHECK (EXISTS (
  SELECT 1 FROM chat_conversations
  WHERE id = chat_messages.conversation_id AND user_id = auth.uid()
));
