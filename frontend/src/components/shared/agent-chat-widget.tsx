"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bot, X, Send, Sparkles, User } from "lucide-react";

type Message = { role: "user" | "agent"; text: string };

const DEMO_REPLY =
  "Based on your authorized scope, the main Q3 risk is delayed vendor reconciliation in the AP Team. Three documents support this finding.";

const SUGGESTIONS = [
  "Summarize recent documents",
  "What are open Q3 risks?",
  "List pending tasks",
];

export function AgentChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "agent", text: DEMO_REPLY }]);
      setLoading(false);
      if (!open) setUnread((n) => n + 1);
    }, 1300);
  };

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-strong fixed bottom-20 right-4 z-50 flex w-[360px] flex-col overflow-hidden rounded-xl"
            style={{ maxHeight: "calc(100vh - 120px)", height: 500 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                <Bot className="h-3.5 w-3.5 text-white/80" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-white/90">Nexus Agent</p>
                <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-white/35">Scope-aware retrieval</span>
                </div>
              </div>
              <Sparkles className="h-3 w-3 text-white/30" />
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                aria-label="Close agent chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 py-8 text-center"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                      <Bot className="h-4 w-4 text-white/45" />
                    </div>
                    <p className="text-xs text-white/40 max-w-[220px]">
                      Ask about scoped documents, tasks, or analytics.
                    </p>
                    <div className="flex flex-col gap-1.5 w-full mt-1">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-left text-xs text-white/55 transition-colors hover:border-white/15 hover:bg-white/[0.04] hover:text-white/90"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        m.role === "user"
                          ? "border-white/15 bg-white/[0.06]"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-3 w-3 text-white/75" />
                      ) : (
                        <Bot className="h-3 w-3 text-white/55" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-white/[0.06] text-white/95"
                          : "bg-white/[0.03] text-white/80"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                      <Bot className="h-3 w-3 text-white/55" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-3 py-2.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1 w-1 rounded-full bg-white/40"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.08] px-3 py-2.5">
              <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 focus-within:border-white/25">
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent text-xs text-white outline-none placeholder-white/30"
                  placeholder="Ask a scoped question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40"
                  aria-label="Send message"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Nexus Agent" : "Open Nexus Agent"}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="glass-strong fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06]"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-4 w-4 text-white/70" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Bot className="h-4 w-4 text-white/80" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white ring-2 ring-[#0b0d12]"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
