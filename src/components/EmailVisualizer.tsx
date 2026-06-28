import React from "react";
import { X, Mail, CheckCircle, Clock, Send, ShieldCheck, MailCheck } from "lucide-react";
import { EmailLog } from "../types";

interface EmailVisualizerProps {
  emailLog: EmailLog | null;
  onClose: () => void;
}

export default function EmailVisualizer({ emailLog, onClose }: EmailVisualizerProps) {
  if (!emailLog) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-ink border border-gold/30 shadow-2xl overflow-hidden animate-fade-in font-sans">
      {/* Header mock mail style */}
      <div className="bg-earth px-4 py-3 flex items-center justify-between border-b border-gold/15">
        <div className="flex items-center gap-2">
          <MailCheck className="w-4 h-4 text-gold shrink-0 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
            Automated Notification Sent!
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-white/50 hover:text-gold hover:bg-white/5 transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message metadata details */}
      <div className="p-4 bg-white/5 border-b border-white/5 text-xs text-white/70 space-y-1 bg-[#1e1e1c]">
        <div className="flex justify-between">
          <span className="text-white/40">From:</span>
          <span className="text-white font-medium">reservations@meghpunji.com</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">To:</span>
          <span className="text-white font-medium select-all">{emailLog.recipientEmail || "guest@meghpunji.com"}</span>
        </div>
        <div className="flex justify-between border-t border-white/5 pt-1 mt-1 text-[11px]">
          <span className="text-white/40">Subject:</span>
          <span className="text-gold font-semibold truncate w-64">{emailLog.subject}</span>
        </div>
      </div>

      {/* Body text area */}
      <div className="p-4 max-h-60 overflow-y-auto bg-black/40 border-b border-white/5">
        <pre className="font-mono text-[10px] sm:text-xs text-white/90 whitespace-pre-wrap leading-relaxed">
          {emailLog.body}
        </pre>
      </div>

      {/* Status footer bar */}
      <div className="px-4 py-2.5 bg-earth/10 flex items-center justify-between text-[9px] uppercase tracking-wider text-white/50">
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          Mail Delivered (SMTP Status 250 OK)
        </span>
        <span className="text-white/30">Just Now</span>
      </div>
    </div>
  );
}
