/**
 * Chat Service for Frontend (REST via backend)
 */

import { apiFetch, withAuthHeaders } from './apiClient';

export interface ChatMessage {
  id: string;
  userId: string;
  email: string;
  alias: string;
  message: string;
  timestamp?: string;
  createdAt: string;
}

type ChatResponse = {
  messages: ChatMessage[];
};

export const fetchGlobalChatMessages = async (
  limit = 50,
  uid?: string,
  email?: string,
): Promise<ChatMessage[]> => {
  const query = new URLSearchParams({ limit: String(limit) });
  const headers = uid && email ? withAuthHeaders(uid, email) : undefined;
  const data = await apiFetch<ChatResponse>(`/api/chat/messages?${query.toString()}`, {
    headers,
  });
  return data.messages ?? [];
};

export const sendGlobalMessage = async (
  userId: string,
  email: string,
  alias: string,
  message: string,
): Promise<void> => {
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (message.length > 500) {
    throw new Error('Message is too long (max 500 characters)');
  }

  await apiFetch('/api/chat/send', {
    method: 'POST',
    headers: withAuthHeaders(userId, email),
    body: JSON.stringify({ alias, message: message.trim() }),
  });
};

export const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  } catch {
    return '';
  }
};
