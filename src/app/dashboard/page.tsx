'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  conversation_count: number;
  repo_count: number;
  memory_count: number;
  last_active?: string;
}

const COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#eab308'];

function timeAgo(date?: string) {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProjects(data.projects || []); })
      .finally(() => setLoading(false));
  }, [router]);

  async function createProject() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, color: newColor }),
      });
      const data = await res.json();
      const proj = data.project;
      setProjects((prev) => [{ ...proj, conversation_count: 0, repo_count: 0, memory_count: 0 }, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowForm(false);
      router.push(`/projects/${proj.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xl font-black gradient-text">Cortex</span>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 rounded-lg font-semibold text-white"
            style={{ background: 'var(--primary)' }}
          >
            + New Project
          </button>
          <button
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
            className="text-sm px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">Your Projects</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Each project has its own memory, repos, and conversation history.
          </p>
        </div>

        {/* New project form */}
        {showForm && (
          <div className="card p-6 mb-8">
            <h2 className="font-bold mb-4">New Project</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project name (e.g. Zoobicon, TradeOS)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createProject()}
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Colour</p>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        background: c,
                        transform: newColor === c ? 'scale(1.25)' : 'scale(1)',
                        outline: newColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={createProject}
                  disabled={!newName.trim() || creating}
                  className="px-5 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
                  style={{ background: 'var(--primary)' }}
                >
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 rounded-lg text-sm border"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-xl font-bold mb-2">No projects yet</h2>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
              Create your first project. Connect a repo. Start building with an AI that remembers everything.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-lg font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              Create first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="card p-5 cursor-pointer hover:border-orange-500/40 transition-all group" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <h3 className="font-bold text-sm truncate group-hover:text-orange-400 transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--muted)' }}>
                      {timeAgo(p.last_active)}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {p.description}
                    </p>
                  )}
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                    <span>💬 {p.conversation_count}</span>
                    <span>📦 {p.repo_count} repos</span>
                    <span>🧠 {p.memory_count} memories</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add project card */}
            <button
              onClick={() => setShowForm(true)}
              className="card p-5 cursor-pointer border-dashed hover:border-orange-500/40 transition-all text-left"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full border-2 border-dashed flex-shrink-0" style={{ borderColor: 'var(--muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>New project</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Add a project with its own memory and repos</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
