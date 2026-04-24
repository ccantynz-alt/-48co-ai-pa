'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message { id: string; role: 'user' | 'assistant'; content: string; model?: string; }
interface Conversation { id: string; title: string; updated_at: string; message_count: number; }
interface MemoryEntry { key: string; value: string; category: string; }
interface Project { id: string; name: string; description?: string; color: string; }

const MODEL_LABELS: Record<string, string> = {
  'claude-haiku-4-5': 'Haiku',
  'claude-sonnet-4-6': 'Sonnet',
  'claude-opus-4-7': 'Opus',
};

const MODEL_COLORS: Record<string, string> = {
  'claude-haiku-4-5': '#6b7280',
  'claude-sonnet-4-6': '#f97316',
  'claude-opus-4-7': '#8b5cf6',
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [currentModel, setCurrentModel] = useState('claude-sonnet-4-6');
  const [showMemory, setShowMemory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/conversations/${convId}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages || []);
  }, []);

  useEffect(() => {
    async function load() {
      const [projRes, convRes, memRes] = await Promise.all([
        fetch(`/api/projects`),
        fetch(`/api/conversations?projectId=${id}`),
        fetch(`/api/projects/${id}/memory`),
      ]);

      if (projRes.status === 401) { router.push('/login'); return; }

      const projData = await projRes.json();
      const found = (projData.projects || []).find((p: Project) => p.id === id);
      if (found) setProject(found);

      const convData = await convRes.json();
      const convs = convData.conversations || [];
      setConversations(convs);

      if (convs.length > 0) {
        setActiveConv(convs[0].id);
        await loadMessages(convs[0].id);
      }

      const memData = await memRes.json();
      setMemory(memData.memory || []);
    }
    load();
  }, [id, router, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function newConversation() {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, title: 'New conversation' }),
    });
    const data = await res.json();
    const conv = data.conversation;
    setConversations((prev) => [conv, ...prev]);
    setActiveConv(conv.id);
    setMessages([]);
  }

  async function sendMessage() {
    if (!input.trim() || streaming || !activeConv) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', model: currentModel };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch(`/api/conversations/${activeConv}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('Failed to send');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.chunk) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + data.chunk, model: data.model || m.model }
                  : m
              )
            );
          }

          if (data.done) {
            setCurrentModel(data.model || currentModel);
            // Refresh memory after response
            fetch(`/api/projects/${id}/memory`)
              .then((r) => r.json())
              .then((d) => setMemory(d.memory || []));
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: 'Something went wrong. Please try again.' } : m
        )
      );
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const memoryByCategory = memory.reduce<Record<string, MemoryEntry[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Left sidebar — conversations */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/dashboard">
            <span className="text-xs font-bold gradient-text cursor-pointer">← Cortex</span>
          </Link>
          {project && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: project.color }} />
                <span className="text-sm font-bold truncate">{project.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-2">
          <button
            onClick={newConversation}
            className="w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-colors"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            + New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={async () => { setActiveConv(c.id); await loadMessages(c.id); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors"
              style={{
                background: activeConv === c.id ? 'var(--surface-2)' : 'transparent',
                color: activeConv === c.id ? 'var(--foreground)' : 'var(--muted)',
              }}
            >
              <div className="font-medium truncate">{c.title}</div>
              <div className="opacity-60">{c.message_count} messages</div>
            </button>
          ))}
        </div>

        <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowMemory(!showMemory)}
            className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
            style={{ color: showMemory ? 'var(--primary)' : 'var(--muted)' }}
          >
            🧠 Memory ({memory.length})
          </button>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Model indicator */}
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2">
            {Object.entries(MODEL_LABELS).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCurrentModel(id)}
                className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                style={{
                  background: currentModel === id ? MODEL_COLORS[id] + '33' : 'transparent',
                  color: currentModel === id ? MODEL_COLORS[id] : 'var(--muted)',
                  border: `1px solid ${currentModel === id ? MODEL_COLORS[id] : 'transparent'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Auto-selects best model per message
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-bold mb-2">
                {project?.name || 'Project'} — ready
              </h3>
              <p className="text-sm max-w-sm" style={{ color: 'var(--muted)' }}>
                {memory.length > 0
                  ? `I remember ${memory.length} things about this project. Ask me anything.`
                  : 'Start a conversation. I\'ll remember everything for next time.'}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-last' : ''}`}>
                {msg.role === 'assistant' && msg.model && (
                  <div className="text-xs mb-1 flex items-center gap-1" style={{ color: MODEL_COLORS[msg.model] || 'var(--muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: MODEL_COLORS[msg.model] || 'var(--muted)' }} />
                    {MODEL_LABELS[msg.model] || msg.model}
                  </div>
                )}
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                    color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {msg.content || <span className="opacity-50 animate-pulse">▊</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-3 items-end rounded-2xl p-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={activeConv ? 'Message Cortex… (Enter to send, Shift+Enter for new line)' : 'Create a conversation to start'}
              disabled={!activeConv || streaming}
              className="flex-1 bg-transparent border-none resize-none outline-none text-sm"
              style={{ maxHeight: '200px', color: 'var(--foreground)' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming || !activeConv}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm disabled:opacity-30 transition-all"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {streaming ? '…' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — memory */}
      {showMemory && (
        <div className="w-64 flex-shrink-0 border-l flex flex-col" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-sm">🧠 Project Memory</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Auto-updated after each conversation
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {memory.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: 'var(--muted)' }}>
                No memories yet. Start a conversation and I&apos;ll start remembering.
              </p>
            ) : (
              Object.entries(memoryByCategory).map(([category, entries]) => (
                <div key={category}>
                  <div className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--primary)' }}>
                    {category}
                  </div>
                  <div className="space-y-2">
                    {entries.map((m) => (
                      <div key={m.key} className="rounded-lg p-2" style={{ background: 'var(--surface-2)' }}>
                        <div className="text-xs font-medium mb-0.5">{m.key}</div>
                        <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
