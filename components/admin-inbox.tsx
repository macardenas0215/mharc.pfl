"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
type Message = {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read_status: boolean;
};
export default function Inbox() {
  const db = useMemo(() => getBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [status, setStatus] = useState("Checking session…"),
    [allowed, setAllowed] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setStatus("");
    });
    const { data } = db.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setMessages([]);
      setAllowed(false);
    });
    return () => data.subscription.unsubscribe();
  }, [db]);
  useEffect(() => {
    if (!db || !session) return;
    let alive = true;
    async function load() {
      const { data: admin, error: authError } = await db!
        .from("portfolio_admins")
        .select("user_id")
        .eq("user_id", session!.user.id)
        .maybeSingle();
      if (!alive) return;
      if (authError || !admin) {
        setStatus("This account does not have inbox permission.");
        setAllowed(false);
        return;
      }
      setAllowed(true);
      const { data, error } = await db!
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!alive) return;
      if (error) setStatus("Unable to load messages. Check database setup.");
      else {
        setMessages(data || []);
        setStatus("");
      }
    }
    void load();
    const channel = db
      .channel("private-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          void load();
        },
      )
      .subscribe((s) => {
        if (s === "CHANNEL_ERROR")
          setStatus(
            "Real-time connection unavailable. Refresh to check messages.",
          );
      });
    return () => {
      alive = false;
      void db.removeChannel(channel);
    };
  }, [db, session]);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await db.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setStatus(error ? "Unable to sign in. Check your email and password." : "");
    setBusy(false);
  }
  async function mark(message: Message) {
    if (!db) return;
    const { error } = await db
      .from("contact_messages")
      .update({ read_status: !message.read_status })
      .eq("id", message.id);
    if (error) setStatus("Could not update this message.");
    else
      setMessages((old) =>
        old.map((m) =>
          m.id === message.id ? { ...m, read_status: !m.read_status } : m,
        ),
      );
  }
  return (
    <main className="admin-page">
      <Link href="/" className="text-link">
        ← Back to portfolio
      </Link>
      <div className="admin-top">
        <h1>
          Private inbox<span className="accent">.</span>
        </h1>
        {session && (
          <button
            className="button secondary"
            onClick={async () => {
              await db?.auth.signOut();
              setMessages([]);
              setAllowed(false);
            }}
          >
            Sign out
          </button>
        )}
      </div>
      {!db ? (
        <p>
          Connect Supabase using the environment setup in the README to enable
          this protected inbox.
        </p>
      ) : !session ? (
        <form className="admin-form" onSubmit={login}>
          <p>Sign in with your administrator account.</p>
          <label>
            Email
            <input type="email" name="email" required autoComplete="username" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : allowed ? (
        <>
          <p>Latest 100 messages · updates arrive in real time.</p>
          {!messages.length && <p>Your inbox is empty.</p>}
          {messages.map((m) => (
            <article className="message-card" key={m.id}>
              <small>
                {m.read_status ? "READ" : "UNREAD"} ·{" "}
                {new Date(m.created_at).toLocaleString()}
              </small>
              <h2 style={{ fontSize: 23, marginTop: 15 }}>{m.subject}</h2>
              <p>
                {m.full_name} · {m.email}
              </p>
              <p>{m.message}</p>
              <button className="button secondary" onClick={() => mark(m)}>
                Mark as {m.read_status ? "unread" : "read"}
              </button>
            </article>
          ))}
        </>
      ) : null}
      <p role="status">{status}</p>
    </main>
  );
}
