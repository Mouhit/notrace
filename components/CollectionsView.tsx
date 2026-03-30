"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronRight, Loader2, FolderOpen, Copy, Clock, CheckCircle2, Flame, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useOwnerId } from "@/lib/useOwnerId";
import Link from "next/link";

const EMOJI_OPTIONS = ["📁","🔒","💼","👨‍👩‍👧","💻","🚀","❤️","🌟","🔑","📝","🎯","⚡","🛡️","🎁","🌈"];

interface Collection {
  id: string;
  name: string;
  emoji: string;
  total: number;
  unread: number;
  expired: number;
  created_at: string;
}

interface Secret {
  id: string;
  title: string | null;
  status: "read" | "unread" | "expired";
  created_at: string;
  expires_at: string | null;
  scheduled_at: string | null;
  expiry: string;
}

function SecretRow({ secret }: { secret: Secret }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/s/${secret.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusIcon = {
    unread: <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />,
    read: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
    expired: <Flame className="w-3.5 h-3.5 text-red-400/60" />,
  }[secret.status];

  const statusLabel = {
    unread: <span className="text-brand">Unread</span>,
    read: <span className="text-slate-500">Read</span>,
    expired: <span className="text-red-400/70">Expired</span>,
  }[secret.status];

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-surface-border bg-surface hover:border-slate-700 transition-all group">
      <div className="flex items-center gap-3 min-w-0">
        {statusIcon}
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{secret.title || "Untitled secret"}</p>
          <p className="text-xs text-slate-600 mt-0.5">
            {statusLabel} · {new Date(secret.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      {secret.status === "unread" && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-border text-xs text-slate-400 hover:text-brand hover:border-brand-border transition-all"
        >
          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      )}
    </div>
  );
}

function CollectionDetail({ collection, ownerId, onBack }: { collection: Collection; ownerId: string; onBack: () => void }) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/collections/secrets?collection_id=${collection.id}&owner_id=${ownerId}`)
      .then((r) => r.json())
      .then((d) => setSecrets(d.secrets || []))
      .finally(() => setLoading(false));
  }, [collection.id, ownerId]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-2xl">{collection.emoji}</span>
        <div>
          <h2 className="text-xl font-bold text-white">{collection.name}</h2>
          <p className="text-xs text-slate-500">{collection.total} secrets · {collection.unread} unread</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      ) : secrets.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-slate-500 text-sm">No secrets in this collection yet.</p>
          <Link href="/" className="text-xs text-brand hover:underline">Create one now →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {secrets.map((s) => <SecretRow key={s.id} secret={s} />)}
        </div>
      )}
    </div>
  );
}

export default function CollectionsView() {
  const ownerId = useOwnerId();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Collection | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    fetch(`/api/collections?owner_id=${ownerId}`)
      .then((r) => r.json())
      .then((d) => setCollections(d.collections || []))
      .finally(() => setLoading(false));
  }, [ownerId]);

  const handleCreate = async () => {
    if (!newName.trim() || !ownerId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: ownerId, name: newName.trim(), emoji: newEmoji }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newCol: Collection = { id: data.id, name: newName.trim(), emoji: newEmoji, total: 0, unread: 0, expired: 0, created_at: new Date().toISOString() };
      setCollections((prev) => [newCol, ...prev]);
      setNewName(""); setNewEmoji("📁"); setCreating(false);
      toast.success("Collection created!");
    } catch { toast.error("Failed to create collection"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!ownerId) return;
    await fetch("/api/collections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, owner_id: ownerId }),
    });
    setCollections((prev) => prev.filter((c) => c.id !== id));
    toast.success("Collection deleted");
  };

  if (selected && ownerId) {
    return <CollectionDetail collection={selected} ownerId={ownerId} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Collections</h1>
          <p className="text-sm text-slate-500 mt-1">Organise and track your secrets.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-surface font-bold text-xs hover:bg-brand-dim transition-all glow-brand"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-2xl border border-brand-border bg-brand-muted p-5 space-y-4 animate-fade-up">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest">New Collection</p>

          {/* Emoji picker */}
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button key={e} onClick={() => setNewEmoji(e)}
                className={`text-xl w-9 h-9 rounded-lg border transition-all ${newEmoji === e ? "border-brand bg-brand/20" : "border-surface-border hover:border-slate-600"}`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Collection name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              maxLength={40}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border transition-all"
            />
            <button onClick={handleCreate} disabled={saving || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-surface font-bold text-sm hover:bg-brand-dim disabled:opacity-40 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </button>
            <button onClick={() => setCreating(false)}
              className="px-3 py-2.5 rounded-xl border border-surface-border text-xs text-slate-500 hover:text-slate-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collections list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-slate-500 text-sm">No collections yet.</p>
          <p className="text-slate-600 text-xs">Create one to start organising your secrets.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <div key={col.id}
              className="flex items-center justify-between px-5 py-4 rounded-2xl border border-surface-border bg-surface-card hover:border-brand-border transition-all cursor-pointer group"
              onClick={() => setSelected(col)}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{col.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{col.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{col.total} secrets</span>
                    {col.unread > 0 && (
                      <span className="text-xs text-brand font-semibold">{col.unread} unread</span>
                    )}
                    {col.expired > 0 && (
                      <span className="text-xs text-red-400/70">{col.expired} expired</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-950/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-700 text-center">
        Collections are tied to this device. Save your owner ID to access from other devices.
      </p>
    </div>
  );
}
