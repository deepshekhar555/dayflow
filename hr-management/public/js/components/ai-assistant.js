/**
 * ai-assistant.js — AI Chat component
 */
import { API } from '../api.js';

export function initAIAssistant(feedId, inputId, sendBtnId) {
  const feed    = document.getElementById(feedId);
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  if (!feed || !input || !sendBtn) return;

  // Prompt chips
  document.querySelectorAll('.prompt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.prompt;
      input.focus();
    });
  });

  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    appendBubble(feed, msg, 'user');
    const typing = appendBubble(feed, '⏳ Thinking...', 'ai');

    try {
      const res = await API.chatAI(msg);
      typing.textContent = res.response || res.message || 'I could not find an answer. Please try rephrasing.';
    } catch {
      typing.textContent = '⚠️ AI engine is offline. Start the Python server and try again.';
    }
    feed.scrollTop = feed.scrollHeight;
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

function appendBubble(feed, text, role) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${role}`;
  bubble.textContent = text;
  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
  return bubble;
}
