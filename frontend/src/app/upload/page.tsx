"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Upload as UploadIcon, FileText, X, Lock } from "lucide-react";

export default function UploadPage() {
  const [filename, setFilename] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFilename(file.name);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">Upload</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">New document</h1>
        <p className="mt-1 text-sm text-white/45">
          Server-side encryption · Versioned · Scope-tagged on upload
        </p>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6">
        {/* Drop zone */}
        <motion.div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          animate={isDragging ? { scale: 1.005 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
          className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-400/50 bg-blue-400/5"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
        >
          <AnimatePresence mode="wait">
            {filename ? (
              <motion.div
                key="file"
                initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-400/20 bg-blue-400/8">
                  <FileText className="h-4 w-4 text-blue-400/85" />
                </div>
                <p className="text-sm font-medium text-white/90">{filename}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFilename(""); }}
                  className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                  <UploadIcon className="h-4 w-4 text-white/40" />
                </div>
                <p className="text-sm text-white/65">
                  Drag a file or <span className="text-white/90">browse</span>
                </p>
                <p className="text-[11px] text-white/30">PDF · DOCX · DOC · max 50 MB</p>
              </motion.div>
            )}
          </AnimatePresence>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            aria-label="Upload document"
            className="hidden"
            onChange={(e) => setFilename(e.target.files?.[0]?.name ?? "")}
          />
        </motion.div>

        {/* Metadata fields */}
        <div className="space-y-3">
          {[
            { label: "Document type", placeholder: "e.g. Policy, SOP, Report" },
            { label: "Sensitivity level", placeholder: "e.g. Internal, Confidential, Restricted" },
            { label: "Retention date", placeholder: "YYYY-MM-DD" },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-[11px] font-medium text-white/55">{field.label}</label>
              <input
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.04]"
                placeholder={field.placeholder}
                aria-label={field.label}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-white/35">
            <Lock className="h-3 w-3" />
            Encrypted at rest with SSE-S3
          </div>
          <motion.button
            type="button"
            disabled={!filename}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Upload
          </motion.button>
        </div>
      </div>
    </div>
  );
}
