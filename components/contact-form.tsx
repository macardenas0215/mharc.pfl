"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
export default function ContactForm() {
  const [state, setState] = useState({
    busy: false,
    message: "",
    success: false,
  });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ busy: true, message: "", success: false });
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await r.json();
      setState({
        busy: false,
        message: data.message || "Unable to send. Please try again.",
        success: r.ok,
      });
      if (r.ok) form.reset();
    } catch {
      setState({
        busy: false,
        message: "Connection failed. Your message has not been sent.",
        success: false,
      });
    }
  }
  return (
    <form onSubmit={submit} className="contact-form">
      <div className="form-row">
        <label>
          Full name
          <input
            required
            name="full_name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            placeholder="Your name"
          />
        </label>
        <label>
          Email address
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label>
        Subject
        <input
          required
          name="subject"
          minLength={3}
          maxLength={160}
          placeholder="What would you like to talk about?"
        />
      </label>
      <label>
        Message
        <textarea
          required
          name="message"
          minLength={10}
          maxLength={5000}
          rows={5}
          placeholder="Tell me a little about your idea…"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-bottom">
        <span>Your next great idea starts with a hello.</span>
        <button className="button primary" disabled={state.busy}>
          {state.busy ? <LoaderCircle className="spin" size={17} /> : null}
          {state.busy ? "Sending…" : "Send message"}
          <ArrowUpRight size={17} />
        </button>
      </div>
      <p
        role="status"
        className={state.success ? "form-success" : "form-error"}
      >
        {state.message}
      </p>
    </form>
  );
}
