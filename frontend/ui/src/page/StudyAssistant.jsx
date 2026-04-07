import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as pdfjsLib from "pdfjs-dist";
import { FiSend, FiMoon, FiSun, FiBookmark, FiFileText, FiStar, FiFile, FiChevronRight, FiDownload, FiX, FiMenu, FiMessageCircle, FiBook, FiGitBranch, FiHelpCircle, FiUploadCloud } from "react-icons/fi";
import { MdLightbulb, MdMenuBook } from "react-icons/md";
import "highlight.js/styles/atom-one-dark.css";

// Set up PDF.js worker served locally from Nginx
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

// API base - works with both Vite proxy (dev) and Nginx proxy (docker)
const API_BASE = "";

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:        #f8f9fc;
  --surface:   #ffffff;
  --elevated:  #f3f5f9;
  --border:    #e5e9f2;
  --border-hi: #d1dae6;
  --text:      #1a1f3a;
  --text-secondary: #6b7280;
  --muted:     #9ca3af;
  --accent:    #6366f1;
  --accent-dark: #4f46e5;
  --accent2:   #8b5cf6;
  --accent3:   #a78bfa;
  --success:   #10b981;
  --warning:   #f59e0b;
  --danger:    #ef4444;
  --glow:      rgba(99, 102, 241, 0.1);
  --r:         12px;
  --tr:        0.3s cubic-bezier(.4,0,.2,1);
}

html.dark{
  --bg:        #0f172a;
  --surface:   #1e293b;
  --elevated:  #334155;
  --border:    #475569;
  --border-hi: #64748b;
  --text:      #e2e8f0;
  --text-secondary: #cbd5e1;
  --muted:     #94a3b8;
  --accent:    #6366f1;
  --accent-dark: #4f46e5;
  --accent2:   #a855f7;
  --accent3:   #d8b4fe;
  --success:   #10b981;
  --warning:   #f59e0b;
  --danger:    #ef4444;
  --glow:      rgba(99, 102, 241, 0.2);
}

html.light{
  --bg:        #f8f9fc;
  --surface:   #ffffff;
  --elevated:  #f3f5f9;
  --border:    #e5e9f2;
  --border-hi: #d1dae6;
  --text:      #1a1f3a;
  --muted:     #9ca3af;
  --accent:    #6366f1;
  --accent-dark: #4f46e5;
}

html,body,#root{height:100%;overflow:hidden}
body{
  font-family:'Inter',sans-serif;
  background:var(--bg);
  color:var(--text);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* Subtle background pattern */
body::before{
  content:'';
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(99,102,241,.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139,92,246,.04) 0%, transparent 50%);
}

/* ── LAYOUT ─────────────────────────────────────────────────────────────── */
.lumina-app{
  position:relative;z-index:1;
  display:flex;
  flex-direction:column;
  height:100%;
  overflow:hidden;
  background:var(--bg);
}

.lumina-app-content{
  display:flex;
  flex:1;
  overflow:hidden;
  min-height:0;
}

.lumina-sidebar{
  width:280px;
  background:var(--surface);
  border-right:1px solid var(--border);
  padding:20px 16px;
  overflow-y:auto;
  display:flex;
  flex-direction:column;
  gap:12px;
  flex-shrink:0;
}

.lumina-sidebar::-webkit-scrollbar{width:6px}
.lumina-sidebar::-webkit-scrollbar-thumb{background:rgba(124,106,247,0.15);border-radius:3px}
.lumina-sidebar::-webkit-scrollbar-thumb:hover{background:rgba(124,106,247,0.3)}

/* ── HEADER ─────────────────────────────────────────────────────────────── */
.l-header{
  display:none;
}
.h-logo{display:flex;align-items:center;gap:10px;flex-shrink:0}
.h-logomark{
  width:32px;height:32px;border-radius:8px;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:flex;align-items:center;justify-content:center;
  color:white;font-weight:700;font-size:0.95rem;
  box-shadow:0 2px 8px rgba(99,102,241,.15);
}
.h-name{
  font-family:'Syne',sans-serif;
  font-weight:600;font-size:1rem;letter-spacing:-0.3px;
  color:var(--text);
  white-space:nowrap;
}
.h-badge{
  display:none;
}
.h-status{
  display:none;
}
.h-dot{
  display:none;
}
.h-dot.on{
  display:none;
}

.theme-toggle{
  background:transparent;border:none;
  border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all 0.25s ease;color:var(--text);
  flex-shrink:0;margin-left:12px;
  opacity:1;
}
.theme-toggle:hover{
  background:var(--elevated);color:var(--accent);
  opacity:1;
}

/* ── SIDEBAR - HIDDEN ─────────────────────────────────────────────────────── */
.l-sidebar{
  display:none;
  border-right:1px solid var(--border);
  background:var(--surface);
  overflow:hidden;
  min-height:0;
}
.sidebar-inner{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:24px 16px 20px;
  min-height:0;
  display:flex;flex-direction:column;gap:20px;
}
.sidebar-inner>div{display:flex;flex-direction:column;gap:8px;flex-shrink:0}

.s-label{
  font-size:0.65rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;
  color:var(--muted);margin-bottom:8px;
  padding:0 4px;
}

/* Upload zone */
.upload-zone{
  border:2px dashed var(--border-hi);
  border-radius:10px;padding:24px 14px;
  text-align:center;cursor:pointer;
  transition:all 0.3s ease;
  background:var(--elevated);
  position:relative;overflow:hidden;
}
.upload-zone::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(99,102,241,.05),transparent);
  opacity:0;transition:opacity 0.3s ease;pointer-events:none;
}
.upload-zone:hover::before,.upload-zone.drag-over::before{opacity:1}
.upload-zone:hover,.upload-zone.drag-over{
  border-color:var(--accent);
  background:rgba(99,102,241,.02);
  transform:translateY(-2px);
  box-shadow:0 6px 16px rgba(99,102,241,.08);
}
.u-icon{
  width:42px;height:42px;border-radius:10px;margin:0 auto 12px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:flex;align-items:center;justify-content:center;
  transition:all 0.3s ease;
  box-shadow:0 2px 8px rgba(99,102,241,.1);
  color:white;
}
.upload-zone:hover .u-icon{
  transform:translateY(-3px);box-shadow:0 4px 12px rgba(99,102,241,.2);
}
.u-title{
  font-family:'Inter',sans-serif;font-weight:600;font-size:0.85rem;
  margin-bottom:6px;color:var(--text);
  letter-spacing:-0.2px;
}
.u-sub{font-size:0.72rem;color:var(--muted);line-height:1.5;font-weight:400}
.u-sub em{color:var(--accent);font-style:normal;font-weight:600}

/* Progress */
.prog-wrap{
  margin-top:10px;height:2px;
  background:var(--border);border-radius:1px;overflow:hidden;
}
.prog-bar{
  height:100%;border-radius:1px;
  background:linear-gradient(90deg,var(--accent),var(--accent2));
  transition:width 0.4s ease;
}

/* Doc card */
.doc-card{
  margin-top:10px;
  background:var(--elevated);
  border:1px solid var(--border);
  border-radius:8px;
  padding:10px 12px;
  display:flex;align-items:flex-start;gap:10px;
  animation:fadeUp 0.35s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
  transition:all 0.25s ease;
}
.doc-card:hover{
  border-color:var(--accent);
  background:var(--surface);
  box-shadow:0 2px 8px rgba(99,102,241,.08);
}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.d-icon{
  width:28px;height:28px;flex-shrink:0;border-radius:6px;
  background:linear-gradient(135deg,#e74c3c,#c0392b);
  display:flex;align-items:center;justify-content:center;
  font-size:0.9rem;
}
.d-info{flex:1;min-width:0}
.d-name{
  font-size:0.75rem;font-weight:500;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  color:var(--text);
}
.d-meta{font-size:0.65rem;color:var(--muted);margin-top:2px}
.d-pill{
  display:inline-flex;align-items:center;gap:5px;
  font-size:0.6rem;font-weight:600;letter-spacing:0.05em;
  padding:3px 8px;border-radius:4px;margin-top:6px;
  width:fit-content;
}
.d-pill::before{
  content:'';
  width:4px;height:4px;border-radius:50%;display:block;flex-shrink:0;
}
.d-pill.ready{
  background:rgba(16,185,129,.1);color:var(--success);
}
.d-pill.ready::before{
  background:var(--success);box-shadow:0 0 4px rgba(16,185,129,.4);
}
.d-pill.proc{
  background:rgba(245,158,11,.1);color:var(--warning);
}
.d-pill.proc::before{
  background:var(--warning);animation:spin 2s linear infinite;
}
.d-rm{
  background:none;border:none;cursor:pointer;
  color:var(--muted);padding:2px;border-radius:4px;
  transition:all var(--tr);line-height:1;flex-shrink:0;
  font-size:0.85rem;
}
.d-rm:hover{color:var(--danger);background:rgba(239,68,68,.1)}

/* Suggestions */
.suggestions{display:flex;flex-direction:column;gap:6px}
.sug-btn{
  display:flex;align-items:center;gap:10px;
  width:100%;background:transparent;
  border:1px solid var(--border);border-radius:8px;
  padding:10px 12px;
  font-family:'Inter',sans-serif;font-size:0.77rem;color:var(--muted);font-weight:500;
  text-align:left;cursor:pointer;
  transition:all var(--tr);line-height:1.4;
}
.sug-btn:hover{
  border-color:var(--accent);
  color:var(--text);background:rgba(99,102,241,0.06);
  transform:translateX(2px);
}
.sug-arrow{
  display:inline-flex;align-items:center;justify-content:center;
  width:14px;height:14px;border-radius:2px;
  background:rgba(99,102,241,0.12);color:var(--accent);
  flex-shrink:0;font-size:0.65rem;font-weight:600;
}

/* Sidebar footer - HIDDEN */
.s-footer{
  display:none;
}

/* ── CHAT AREA ───────────────────────────────────────────────────────────── */
.l-chat{
  display:flex;flex-direction:column;
  background:var(--bg);
  overflow:hidden;
  min-width:0;
  min-height:0;
  flex:1;
}

/* Toolbar - SIMPLIFIED */
.c-toolbar{
  display:none;
}

.c-docbadge{
  display:none;
}
.c-clear{
  display:none;
}

/* Messages scroll area */
.messages{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:40px 56px 24px;
  display:flex;flex-direction:column;gap:20px;
  scroll-behavior:smooth;
  min-height:0;
  max-width:900px;
  margin:0 auto;
  width:100%;
}
.messages::-webkit-scrollbar{width:6px}
.messages::-webkit-scrollbar-thumb{background:rgba(124,106,247,0.15);border-radius:3px}
.messages::-webkit-scrollbar-thumb:hover{background:rgba(124,106,247,0.3)}

/* Empty state with suggestions */
.empty{
  flex:1;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;gap:24px;padding:40px 20px;
  animation:fadeIn 0.5s ease;
}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.e-ring{
  width:64px;height:64px;border-radius:50%;
  border:2px solid rgba(99,102,241,0.1);
  display:flex;align-items:center;justify-content:center;
  position:relative;flex-shrink:0;
  font-size:2.5rem;
}
.e-ring::before{
  content:'';position:absolute;inset:-10px;border-radius:50%;
  border:2px solid transparent;
  border-top-color:var(--accent);
  border-right-color:var(--accent2);
  animation:spin 4s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.e-title{
  font-family:'Inter',sans-serif;font-size:1.3rem;font-weight:600;
  color:var(--text);
  letter-spacing:-0.3px;
}
.e-sub{font-size:0.95rem;color:var(--muted);max-width:400px;line-height:1.7;font-weight:400;margin-bottom:12px}

/* Quick suggestions grid */
.quick-suggestions{
  display:flex;flex-direction:column;gap:8px;
}
.quick-suggestions .label{
  font-size:0.65rem;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--muted);
  margin-bottom:4px;
}
.suggestions-grid{
  display:flex;flex-direction:column;gap:6px;
}
.sug-chip{
  display:flex;align-items:center;justify-content:flex-start;
  gap:8px;padding:10px 12px;
  background:var(--elevated);border:1px solid var(--border);
  border-radius:8px;cursor:pointer;
  font-size:0.75rem;font-weight:500;color:var(--text);
  transition:all 0.25s cubic-bezier(.4,0,.2,1);text-align:left;
  font-family:'Inter',sans-serif;outline:none;
  position:relative;overflow:hidden;
}
.sug-chip::before{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(99,102,241,.1),transparent);
  opacity:0;transition:opacity 0.25s ease;pointer-events:none;
}
.sug-chip:hover{
  background:var(--surface);
  transform:translateX(4px);
  box-shadow:0 4px 12px rgba(99,102,241,.12);
  border-color:rgba(99,102,241,.3);
}
.sug-chip:hover::before{
  opacity:1;
}
.sug-chip:active{
  background:rgba(91,79,207,0.15);
  border:1px solid var(--border);
  border-left:3px solid #5b4fcf;
  padding-left:10px;
  transform:translateX(2px);
}
.sug-chip:focus-visible{
  outline:none;
}

/* Drag and drop zone */
.drag-drop-zone{
  width:100%;max-width:420px;margin:0 auto;
  padding:40px 24px;border:2px dashed rgba(99,102,241,0.5);
  border-radius:12px;background:var(--elevated);
  cursor:pointer;transition:all 0.3s ease;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:16px;text-align:center;
}
.drag-drop-zone:hover,
.drag-drop-zone.drag-over{
  border-color:var(--accent);background:rgba(99,102,241,0.03);
}
.dz-icon{
  width:48px;height:48px;border-radius:12px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:flex;align-items:center;justify-content:center;
  font-size:1.8rem;flex-shrink:0;
  transition:all 0.3s ease;
}
.drag-drop-zone:hover .dz-icon,
.drag-drop-zone.drag-over .dz-icon{
  transform:scale(1.1);
}
.dz-content{
  display:flex;flex-direction:column;gap:4px;
}
.dz-main{
  font-size:0.95rem;font-weight:600;color:var(--text);
}
.dz-hint{
  font-size:0.8rem;color:var(--muted);
}

/* Landing suggestion chips */
.landing-suggestions{
  display:flex;flex-wrap:wrap;gap:8px;justify-content:center;
  margin-top:24px;max-width:500px;margin-left:auto;margin-right:auto;
}
.chip-btn{
  display:inline-flex;align-items:center;justify-content:center;
  padding:8px 14px;border-radius:20px;border:1px solid var(--border);
  background:var(--elevated);color:var(--muted);
  font-size:0.8rem;font-weight:500;cursor:pointer;
  transition:all 0.3s cubic-bezier(.4,0,.2,1);white-space:nowrap;
  font-family:'Inter',sans-serif;position:relative;overflow:hidden;
}
.chip-btn::before{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(99,102,241,.15),transparent);
  opacity:0;transition:opacity 0.3s ease;pointer-events:none;
}
.chip-btn:hover:not(:disabled){
  border-color:var(--accent);color:var(--accent);
  background:rgba(99,102,241,0.08);
  transform:translateY(-2px);
  box-shadow:0 4px 12px rgba(99,102,241,0.15);
}
.chip-btn:hover:not(:disabled)::before{
  opacity:1;
}
.chip-btn:disabled{
  opacity:0.4;cursor:not-allowed;pointer-events:none;
}
.chip-btn:active:not(:disabled){
  transform:scale(0.98);
}

/* Recent documents section */
.recent-docs{
  margin-top:32px;max-width:500px;margin-left:auto;margin-right:auto;width:100%;
}
.recent-docs-label{
  font-size:0.7rem;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--muted);
  margin-bottom:8px;display:block;padding:0 2px;
}
.recent-docs-list{
  display:flex;flex-direction:column;gap:6px;
}
.recent-doc-row{
  display:flex;align-items:center;gap:10px;padding:10px 12px;
  background:var(--elevated);border:1px solid var(--border);
  border-radius:8px;cursor:pointer;
  transition:all 0.3s ease;font-size:0.85rem;color:var(--text);
  font-family:'Inter',sans-serif;
}
.recent-doc-row:hover{
  border-color:var(--accent);background:rgba(99,102,241,0.03);
  transform:translateX(2px);
}
.doc-dot{
  width:8px;height:8px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
}
.doc-name{
  flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-weight:500;
}
.doc-date{
  font-size:0.75rem;color:var(--muted);flex-shrink:0;
}

/* Upload btn in empty state (kept for backwards compatibility) */
.empty-upload-btn{
  display:inline-flex;align-items:center;gap:8px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;
  border:none;border-radius:10px;
  padding:12px 24px;
  font-size:0.9rem;font-weight:600;
  cursor:pointer;
  transition:all 0.3s ease;
  box-shadow:0 4px 12px rgba(99,102,241,.25);
}
.empty-upload-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 20px rgba(99,102,241,.35);
}

/* Upload button in header */
.header-upload-btn{
  display:flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:8px;
  background:transparent;border:none;
  cursor:pointer;color:var(--muted);
  transition:all 0.25s ease;
  opacity:0.7;
  flex-shrink:0;
}
.header-upload-btn:hover{
  background:var(--elevated);
  color:var(--accent);
  opacity:1;
}

/* Message row */
.msg-row{
  display:flex;gap:14px;
  animation:msgIn 0.35s cubic-bezier(.34,1.56,.64,1);
  max-width:100%;
}
@keyframes msgIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.msg-row.user{flex-direction:row-reverse}

.avatar{
  width:32px;height:32px;border-radius:50%;
  flex-shrink:0;display:flex;align-items:center;justify-content:center;
  font-family:'Inter',sans-serif;font-size:0.7rem;font-weight:600;
  margin-top:6px;
}
.avatar.ai{
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;box-shadow:0 0 12px rgba(99,102,241,.3);
}
.avatar.user{background:var(--elevated);color:var(--muted);border:1.5px solid rgba(99,102,241,.15)}

.bubble{
  max-width:min(75%, 640px);
  padding:14px 18px;
  border-radius:14px;
  font-size:0.9rem;line-height:1.6;
  position:relative;word-break:break-word;
  overflow-wrap:anywhere;
}
.msg-row.user .bubble{
  background:#2a2b3d;
  color:white;border-bottom-right-radius:4px;
  box-shadow:0 4px 12px rgba(0,0,0,.15);
}
.msg-row.ai .bubble{
  background:var(--surface);
  border:1px solid var(--border);
  border-bottom-left-radius:4px;
  color:var(--text);
}
.bubble.from-document{
  border-left:3px solid #5b4fcf;
}

/* Sources */
.sources{margin-top:12px;padding-top:10px;border-top:1px solid rgba(124,106,247,0.1)}
.src-label{
  font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  color:var(--muted);margin-bottom:8px;display:block;
}
.src-chip{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(124,106,247,0.08);
  border:1px solid rgba(124,106,247,0.2);
  border-radius:6px;padding:4px 10px;
  font-size:0.67rem;color:var(--accent2);
  font-family:'JetBrains Mono',monospace;
  margin:3px 4px 3px 0;
  font-weight:500;
}
.src-chip::before{
  content:'';
  width:4px;height:4px;border-radius:50%;
  background:var(--accent2);
}

/* Thinking */
.thinking-row{display:flex;gap:11px;align-items:center}
.think-bubble{
  background:var(--elevated);border:1px solid var(--border);
  border-radius:14px;border-bottom-left-radius:4px;
  padding:11px 16px;display:flex;align-items:center;gap:8px;
  font-size:0.8rem;color:var(--muted);font-style:italic;
}
.think-dots{display:flex;gap:3px;align-items:center}
.think-dots span{
  width:5px;height:5px;border-radius:50%;
  background:var(--accent);display:block;
  animation:blink 1.4s ease-in-out infinite;
}
.think-dots span:nth-child(2){animation-delay:.2s}
.think-dots span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}

/* ── EXPLANATION LEVEL TOGGLE ──────────────────────────────────────────── */
.level-toggle-group{
  display:flex;gap:0;align-items:center;justify-content:center;
  background:var(--elevated);border:1px solid var(--border);
  border-radius:8px;padding:4px;width:fit-content;margin:0 auto 12px;
}
.level-btn{
  padding:6px 14px;background:transparent;border:none;
  border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:500;
  color:var(--text-secondary);transition:all 0.25s ease;
  font-family:'Inter',sans-serif;white-space:nowrap;
}
.level-btn:hover{
  background:rgba(99,102,241,.08);
}
.level-btn.active{
  background:#5b4fcf;color:white;
}

/* ── STUDY MODE TOGGLE ──────────────────────────────────────────── */
.study-mode-group{
  display:flex;gap:0;align-items:center;justify-content:center;
  background:var(--elevated);border:1px solid var(--accent2);
  border-radius:8px;padding:4px;width:fit-content;margin:0 auto 12px;
}
.mode-btn{
  padding:7px 12px;background:transparent;border:none;
  border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:500;
  color:var(--text-secondary);transition:all 0.25s ease;
  font-family:'Inter',sans-serif;white-space:nowrap;
  display:flex;align-items:center;gap:4px;
}
.mode-btn:hover{
  background:rgba(139,92,246,.12);
}
.mode-btn.active{
  background:#a78bfa;color:white;font-weight:600;
}

/* ── ANIMATED ICONS & BUTTONS ──────────────────────────────────────────── */
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes pulse-glow{0%,100%{box-shadow:0 0 10px var(--glow)}50%{box-shadow:0 0 20px rgba(99,102,241,.3)}}
@keyframes slide-right{from{transform:translateX(-4px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-1px)}75%{transform:translateX(1px)}}

.btn-icon{
  display:inline-flex;align-items:center;justify-content:center;
  transition:all 0.3s ease;
}

.btn-icon.loading{
  animation:spin 1s linear infinite;
}

.btn-icon.pulse{
  animation:pulse-glow 2s ease-in-out infinite;
}

.btn-icon.bounce{
  animation:bounce 0.6s ease-in-out;
}

.send-btn:hover .btn-icon{
  animation:slide-right 0.4s ease-out;
}

.theme-toggle:hover .btn-icon{
  animation:float 0.6s ease-in-out;
}

.u-icon:hover{
  animation:bounce 0.6s ease-in-out;
}

.s-btn:hover .s-btn-icon{
  animation:float 0.6s ease-in-out;
}
/* Input area */
.input-area{
  padding:20px 34px 28px;
  flex-shrink:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  max-width:900px;
  margin:0 auto;
  width:100%;
}
.input-shell{
  display:flex;align-items:flex-end;gap:10px;
  background:var(--surface);
  border:1.5px solid var(--border);
  border-radius:12px;
  padding:10px 10px 10px 16px;
  transition:all 0.3s ease;
  width:100%;
}
.input-shell:focus-within{
  border-color:var(--accent);
  box-shadow:0 0 0 3px rgba(99,102,241,.08);
  transform:none;
}
.chat-input{
  flex:1;background:none;border:none;outline:none;
  font-family:'Inter',sans-serif;font-size:0.9rem;color:var(--text);
  resize:none;max-height:120px;line-height:1.6;min-height:24px;
  scrollbar-width:none;
  font-weight:500;
  letter-spacing:0.2px;
}
.chat-input::-webkit-scrollbar{display:none}
.chat-input::placeholder{
  color:var(--muted);font-weight:500;
  letter-spacing:0.2px;
}
.chat-input:disabled{opacity:0.4;cursor:not-allowed}
.send-btn{
  width:36px;height:36px;flex-shrink:0;
  border:none;border-radius:8px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  box-shadow:0 2px 8px rgba(99,102,241,.2);
  transition:all 0.25s ease;
  color:white;
}
.send-btn:hover:not(:disabled){
  transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,.3);
}
.send-btn:active:not(:disabled){transform:translateY(0);box-shadow:0 1px 4px rgba(99,102,241,.2)}
.send-btn:disabled{opacity:0.4;cursor:not-allowed;box-shadow:none;transform:none}
.i-hint{
  font-size:0.68rem;color:var(--muted);text-align:center;
  margin-top:8px;font-weight:500;
  letter-spacing:0.2px;
  display:none;
}
.i-hint kbd{
  background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);
  border-radius:4px;padding:2px 6px;
  font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:var(--accent);
  font-weight:600;
}

/* Toast */
.toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  background:linear-gradient(135deg,var(--elevated),rgba(22,29,60,0.8));
  color:var(--text);
  border:1px solid rgba(124,106,247,0.25);
  padding:12px 20px;border-radius:10px;
  font-size:0.85rem;font-weight:500;
  box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 1px rgba(124,106,247,0.3),inset 0 1px 0 rgba(255,255,255,0.08);
  z-index:9999;white-space:nowrap;
  backdrop-filter:blur(20px);
  animation:toastIn 0.4s cubic-bezier(.34,1.56,.64,1),toastOut 0.4s ease 2.8s forwards;
  display:flex;align-items:center;gap:10px;
  letter-spacing:0.3px;
}
.toast::before{
  content:'';width:6px;height:6px;border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  box-shadow:0 0 10px rgba(124,106,247,0.6);
  animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px);filter:blur(4px)}to{opacity:1;transform:translateX(-50%) translateY(0);filter:blur(0)}}
@keyframes toastOut{to{opacity:0;transform:translateX(-50%) translateY(20px);filter:blur(4px)}}

/* Modal */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.6);
  display:flex;align-items:center;justify-content:center;
  z-index:10000;backdrop-filter:blur(4px);
  animation:fadeIn 0.3s ease;
}
.modal-content{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;max-width:800px;width:90vh;max-height:80vh;
  display:flex;flex-direction:column;
  box-shadow:0 20px 60px rgba(0,0,0,0.3);
  animation:slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
.modal-content.expanded-message-modal{
  max-width:1200px;width:95vw;max-height:90vh;
}
.expanded-body{
  font-size: 1rem !important;
  line-height: 1.9 !important;
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.modal-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.modal-header h2{
  font-size:1.2rem;font-weight:600;color:var(--text);
  margin:0;letter-spacing:-0.3px;
}
.modal-close{
  background:transparent;border:none;font-size:1.5rem;
  cursor:pointer;color:var(--muted);transition:all 0.2s ease;
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  border-radius:8px;
}
.modal-close:hover{
  background:var(--elevated);color:var(--accent);
}
.modal-body{
  flex:1;overflow-y:auto;padding:24px;
  font-size:0.95rem;line-height:1.8;color:var(--text);
}
.modal-body h1,.modal-body h2,.modal-body h3,.modal-body h4,.modal-body h5,.modal-body h6{
  margin-top:16px;margin-bottom:8px;font-weight:600;color:var(--text);
}
.modal-body h1{font-size:1.5rem}
.modal-body h2{font-size:1.3rem}
.modal-body h3{font-size:1.1rem}
.modal-body ul,.modal-body ol{margin:12px 0;padding-left:24px}
.modal-body li{margin:6px 0}
.modal-body code{
  background:var(--elevated);padding:2px 6px;border-radius:4px;
  font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:var(--accent);
}
.modal-body pre{
  background:var(--elevated);padding:12px;border-radius:8px;
  overflow-x:auto;margin:12px 0;border:1px solid var(--border);
}
.modal-footer{
  display:flex;align-items:center;gap:10px;justify-content:flex-end;
  padding:16px 24px;border-top:1px solid var(--border);
  flex-shrink:0;
}
.modal-btn{
  padding:10px 18px;border-radius:8px;border:1px solid var(--border);
  font-size:0.9rem;font-weight:600;cursor:pointer;
  transition:all 0.3s ease;background:var(--elevated);
  color:var(--text);font-family:'Inter',sans-serif;
}
.modal-btn:hover{
  border-color:var(--accent);color:var(--accent);background:rgba(99,102,241,0.05);
}
.modal-btn.download{
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;border:none;box-shadow:0 4px 12px rgba(99,102,241,0.25);
}
.modal-btn.download:hover{
  color:white;transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,0.35);
}

/* PDF Viewer & Split Pane */
.pdf-pane{
  flex:1;display:flex;flex-direction:column;
  background:var(--bg);border-left:1px solid var(--border);
  overflow:hidden;
}
.pdf-viewer{
  display:flex;flex-direction:column;height:100%;width:100%;
}
.pdf-header{
  display:flex;align-items:center;gap:8px;padding:12px 16px;
  background:var(--surface);border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.pdf-nav-btn{
  background:var(--elevated);border:1px solid var(--border);
  border-radius:6px;padding:6px 12px;font-size:0.8rem;
  cursor:pointer;transition:all 0.2s ease;color:var(--text);
  font-family:'Inter',sans-serif;font-weight:500;
}
.pdf-nav-btn:hover:not(:disabled){
  border-color:var(--accent);color:var(--accent);background:rgba(99,102,241,0.05);
}
.pdf-nav-btn:disabled{opacity:0.4;cursor:not-allowed}
.pdf-page-info{
  flex:1;font-size:0.85rem;color:var(--muted);display:flex;align-items:center;gap:6px;
}
.pdf-page-input{
  width:50px;padding:4px 8px;border:1px solid var(--border);
  background:var(--elevated);border-radius:4px;color:var(--text);
  font-family:'Inter',sans-serif;font-size:0.8rem;
}
.pdf-zoom{
  padding:6px 10px;border:1px solid var(--border);
  background:var(--elevated);border-radius:6px;color:var(--text);
  font-family:'Inter',sans-serif;font-size:0.8rem;cursor:pointer;
}
.pdf-canvas-container{
  flex:1;overflow:auto;display:flex;align-items:flex-start;justify-content:center;
  padding:16px;background:var(--bg);
}
.pdf-canvas{
  box-shadow:0 2px 12px rgba(0,0,0,0.15);border-radius:4px;
  max-width:100%;height:auto;
}
.pdf-placeholder{
  color:var(--muted);font-size:0.95rem;text-align:center;
  display:flex;align-items:center;justify-content:center;height:100%;
}

/* Bookmarks Panel */
.bookmarks-panel{
  margin-top:16px;padding-top:16px;border-top:1px solid var(--border);
}
.bookmarks-header{
  display:flex;align-items:center;justify-content:space-between;cursor:pointer;
  padding:8px 0;user-select:none;
}
.bookmarks-title{
  font-size:0.7rem;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--muted);
  display:flex;align-items:center;gap:6px;
}
.bookmarks-toggle{
  background:transparent;border:none;color:var(--muted);
  cursor:pointer;font-size:0.9rem;transition:transform 0.2s ease;
}
.bookmarks-toggle.open{
  transform:rotate(90deg);
}
.bookmarks-list{
  display:flex;flex-direction:column;gap:6px;margin-top:8px;max-height:300px;overflow-y:auto;
}
.bookmark-item{
  display:flex;align-items:flex-start;gap:8px;padding:8px 10px;
  background:var(--elevated);border:1px solid var(--border);
  border-radius:6px;cursor:pointer;transition:all 0.2s ease;
  font-size:0.75rem;line-height:1.4;
}
.bookmark-item:hover{
  border-color:var(--accent);background:rgba(99,102,241,0.03);
}
.bookmark-dot{
  width:6px;height:6px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),var(--accent2));margin-top:3px;
}
.bookmark-text{
  flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
}
.bookmark-remove{
  background:transparent;border:none;color:var(--muted);
  cursor:pointer;font-size:0.8rem;padding:0;flex-shrink:0;
  transition:color 0.2s ease;
}
.bookmark-remove:hover{
  color:var(--danger);
}

/* Bookmark button on messages */
.msg-bookmark-btn{
  background:transparent;border:none;color:var(--muted);
  cursor:pointer;font-size:0.85rem;padding:4px 8px;border-radius:4px;
  transition:all 0.2s ease;opacity:0;margin-left:4px;
}
.msg-bubble:hover .msg-bookmark-btn{
  opacity:1;
}
.msg-bookmark-btn:hover{
  color:var(--accent);background:rgba(99,102,241,0.1);
}
.msg-bookmark-btn.bookmarked{
  opacity:1;color:var(--accent);
}


/* Markdown Styling */
.markdown-content h1,.markdown-content h2,.markdown-content h3,.markdown-content h4,.markdown-content h5,.markdown-content h6{
  font-family:'Syne',sans-serif;font-weight:700;margin:14px 0 8px 0;line-height:1.3;
  background:linear-gradient(135deg,var(--accent2),var(--accent3));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.markdown-content h1{font-size:1.2rem}
.markdown-content h2{font-size:1.05rem}
.markdown-content h3{font-size:0.95rem}
.markdown-content h4,.markdown-content h5,.markdown-content h6{font-size:0.87rem}

.markdown-content p{margin:8px 0;line-height:1.7}
.markdown-content ul,.markdown-content ol{margin:8px 0 8px 20px;line-height:1.7}
.markdown-content li{margin:4px 0}
.markdown-content li strong{color:var(--accent2)}

.markdown-content code{
  background:rgba(124,106,247,0.15);color:var(--accent2);
  padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;
  font-size:0.85em;
}
.markdown-content pre{
  background:rgba(10,10,15,0.5);border:1px solid var(--border);
  border-radius:8px;padding:12px;margin:10px 0;overflow-x:auto;
  font-family:'JetBrains Mono',monospace;font-size:0.8rem;line-height:1.5;
}
.markdown-content pre code{
  background:transparent;padding:0;color:var(--text);
}
.markdown-content blockquote{
  border-left:3px solid var(--accent);padding:8px 12px;margin:8px 0;
  background:rgba(99,102,241,.05);border-radius:4px;
  color:var(--text-secondary);font-style:italic;
}
.markdown-content strong{color:var(--text);font-weight:600}
.markdown-content em{color:var(--accent);font-style:italic}
.markdown-content a{color:var(--accent);text-decoration:underline;transition:color var(--tr)}
.markdown-content a:hover{color:var(--accent-dark)}
.markdown-content table{
  border-collapse:collapse;margin:10px 0;width:100%;font-size:0.82rem;
}
.markdown-content table th,.markdown-content table td{
  border:1px solid var(--border);padding:8px;text-align:left;
}
.markdown-content table th{background:var(--elevated);font-weight:600;color:var(--accent)}
.markdown-content hr{border:none;height:1px;background:var(--border);margin:12px 0}

/* Quiz Styling */
.quiz-container{
  border:1px solid var(--border);border-radius:12px;
  background:var(--elevated);
  padding:20px;overflow:hidden;
  box-shadow:0 1px 3px rgba(0,0,0,.03);
}
.quiz-header{
  display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;
  gap:16px;flex-wrap:wrap;
  padding-bottom:12px;border-bottom:1px solid var(--border);
}
.quiz-title{
  font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;
  color:var(--text);letter-spacing:-0.2px;
}
.quiz-count{
  font-size:0.7rem;font-weight:600;letter-spacing:0.08em;
  color:var(--muted);text-transform:uppercase;
  background:var(--surface);padding:5px 10px;border-radius:6px;
  border:1px solid var(--border);
}

/* Q&A Format Styles */
.qa-list{
  display:flex;flex-direction:column;gap:10px;
}
.qa-card{
  border:1px solid var(--border);border-radius:10px;
  background:var(--surface);overflow:hidden;
  transition:all 0.3s ease;
}
.qa-card:hover{
  border-color:var(--accent);
  background:var(--elevated);
  box-shadow:0 2px 8px rgba(99,102,241,.06);
}
.qa-question-btn{
  width:100%;padding:14px;
  background:transparent;border:none;cursor:pointer;
  display:flex;align-items:flex-start;gap:12px;
  text-align:left;transition:all 0.25s ease;
  font-family:'Inter',sans-serif;
}
.qa-question-btn:hover{
  background:var(--elevated);
}
.qa-number{
  min-width:28px;height:28px;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;border-radius:6px;flex-shrink:0;
  font-weight:600;font-size:0.8rem;
}
.qa-question-text{
  flex:1;color:var(--text);font-size:0.9rem;line-height:1.5;
  font-weight:500;letter-spacing:0.1px;
}
.qa-toggle{
  color:var(--accent);font-size:1.2rem;font-weight:600;
  flex-shrink:0;transition:transform 0.3s ease;
  padding:0 4px;
}
.qa-toggle.open{
  transform:rotate(180deg);
}
.qa-answer{
  padding:14px;border-top:1px solid var(--border);
  background:var(--elevated);animation:slideDown 0.35s cubic-bezier(.34,1.56,.64,1);
}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.answer-label{
  font-size:0.65rem;font-weight:700;letter-spacing:0.1em;
  text-transform:uppercase;color:var(--success);margin-bottom:8px;display:flex;align-items:center;gap:5px;
}
.answer-text{
  font-size:0.9rem;color:var(--text);line-height:1.6;
  font-weight:400;margin-bottom:10px;padding:0;
}
.source-badge{
  display:inline-block;font-size:0.62rem;font-weight:600;
  letter-spacing:0.08em;text-transform:uppercase;
  background:rgba(16,185,129,.08);color:var(--success);
  padding:4px 10px;border-radius:6px;border:1px solid rgba(16,185,129,.15);
}

/* Multiple Choice Format Styles */
.mc-questions{
  display:flex;flex-direction:column;gap:14px;
}
.mc-question-card{
  border:1px solid var(--border);border-radius:10px;
  background:var(--surface);padding:16px;
  transition:all 0.3s ease;
}
.mc-question-card:hover{
  border-color:var(--accent);
  background:var(--elevated);
  box-shadow:0 2px 8px rgba(99,102,241,.06);
}
.mc-q-header{
  display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;
}
.mc-q-number{
  min-width:32px;height:32px;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;border-radius:8px;flex-shrink:0;
  font-weight:600;font-size:0.85rem;
}
.mc-q-text{
  flex:1;color:var(--text);font-size:0.95rem;line-height:1.5;
  font-weight:600;letter-spacing:0.1px;
}
.mc-options{
  display:flex;flex-direction:column;gap:8px;margin-bottom:12px;
}
.mc-option-item{
  display:flex;align-items:flex-start;gap:10px;
  padding:10px;background:var(--elevated);
  border:1px solid var(--border);border-radius:8px;
  transition:all 0.25s ease;
}
.mc-option-item:hover{
  background:var(--surface);border-color:var(--accent);
}
.mc-letter{
  min-width:24px;height:24px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(99,102,241,.12);color:var(--accent);
  border-radius:5px;flex-shrink:0;font-weight:600;font-size:0.75rem;
}
.mc-option-text{
  flex:1;color:var(--muted);font-size:0.85rem;line-height:1.5;
  font-weight:500;
}
.mc-answer-hint{
  display:flex;align-items:center;gap:8px;
  padding:10px;background:rgba(16,185,129,.06);
  border:1px solid rgba(16,185,129,.15);border-radius:8px;
  font-size:0.8rem;font-weight:600;
}
.hint-label{color:var(--success);letter-spacing:0.04em;}
.hint-value{
  color:var(--success);
  font-weight:700;font-size:0.85rem;
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────────── */
const LogoIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
    <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
      fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="13" height="13">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="28" height="28">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const PdfSmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{flexShrink:0}}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="18" height="18">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="18" height="18">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"/>
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MARKDOWN RENDERER COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const MarkdownMessage = ({ content, isFromDocument }) => {
  // Strip "[FROM DOCUMENT]" prefix if present
  const cleanContent = content.replace(/^\s*\[FROM\s+DOCUMENT\]\s*/i, '');
  
  // Check if content is pure mermaid code (starts with graph, flowchart, etc)
  const isMermaidDiagram = /^\s*(graph|flowchart|classDiagram|sequenceDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph)/i.test(cleanContent);
  
  // Initialize Mermaid from CDN and properly render
  useEffect(() => {
    const loadAndRenderMermaid = async () => {
      if (!window.mermaid) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.async = true;
        script.onload = async () => {
          if (window.mermaid) {
            window.mermaid.initialize({ 
              startOnLoad: false, 
              theme: 'default',
              securityLevel: 'loose',
              flowchart: { useMaxWidth: true },
              maxTextSize: 50000
            });
            // Wait a bit then render
            setTimeout(async () => {
              try {
                if (window.mermaid.run) {
                  await window.mermaid.run();
                }
              } catch (err) {
                console.error("Mermaid render error:", err);
              }
            }, 100);
          }
        };
        script.onerror = () => {
          console.error("Failed to load Mermaid from CDN");
        };
        document.body.appendChild(script);
      } else if (window.mermaid) {
        try {
          window.mermaid.initialize({ 
            startOnLoad: false, 
            theme: 'default',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true },
            maxTextSize: 50000
          });
          setTimeout(async () => {
            try {
              if (window.mermaid.run) {
                await window.mermaid.run();
              }
            } catch (err) {
              console.error("Mermaid render error:", err);
            }
          }, 50);
        } catch (err) {
          console.error("Mermaid init error:", err);
        }
      }
    };
    
    loadAndRenderMermaid();
  }, [cleanContent, isMermaidDiagram]);
  
  return (
    <div className="markdown-content">
      {isMermaidDiagram ? (
        // If it's pure mermaid code, render directly
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <pre className="mermaid" style={{ maxWidth: '100%', minHeight: '200px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', margin: 0 }}>
            {cleanContent}
          </pre>
        </div>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              
              // Handle mermaid diagrams
              if (!inline && language === 'mermaid') {
                const codeString = String(children).replace(/\n$/, "");
                return (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                    <pre className="mermaid" style={{ maxWidth: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', margin: 0 }}>
                      {codeString}
                    </pre>
                  </div>
                );
              }
              
              if (!inline && language) {
                try {
                  const highlighted = hljs.highlight(String(children).replace(/\n$/, ""), {
                    language: language,
                    ignoreIllegals: true
                  }).value;
                  return (
                    <pre>
                      <code
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                        className={`hljs language-${language}`}
                        {...props}
                      />
                    </pre>
                  );
                } catch {
                  return <code className={className} {...props}>{children}</code>;
                }
              }
              return <code className={className} {...props}>{children}</code>;
            }
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      )}
    </div>
  );
};

const SUGGESTIONS = [
  "Summarize the key points",
  "What are the main arguments?",
  "Explain the hardest concept",
  "Generate 5 quiz questions",
  "What conclusions are drawn?",
  "What are the core definitions?",
  "Create a comparison table",
  "What's the historical context?",
  "Identify practical applications",
  "What are common misconceptions?",
  "Create a visual mind map",
  "Outline the problem and solution",
  "List assumptions and evidence",
  "Generate practice exercises",
  "Explain step by step",
];

const LANDING_SUGGESTIONS = [
  "Summarise key points",
  "Generate a quiz",
  "Explain hardest concept",
  "Create study notes",
];

/* ─────────────────────────────────────────────────────────────────────────────
   QUIZ PARSER & DETECTOR
───────────────────────────────────────────────────────────────────────────── */
const parseQuizContent = (content) => {
  const lines = content.split('\n');
  const questions = [];
  
  // Pattern 1: MultipleChoice format with options A) B) C) D)
  let currentQ = null;
  let currentOptions = [];
  let questionNum = 0;

  // First, try to detect Q&A pairs format (Question\nAnswer:)
  const qaPattern = /^(\d+)\.\s*\[?(?:FROM DOCUMENT|GENERAL KNOWLEDGE)?\]?\s*(.+?)(?:\?|$)/i;
  const answerPattern = /^answer:\s*(.+?)$/i;
  
  let qaPairs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const qMatch = line.match(qaPattern);
    if (qMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      const aMatch = nextLine.match(answerPattern);
      if (aMatch) {
        qaPairs.push({
          text: qMatch[2].trim(),
          answer: aMatch[1].trim(),
          source: line.includes('FROM DOCUMENT') ? 'document' : 'knowledge'
        });
      }
    }
  }

  if (qaPairs.length >= 1) {
    return qaPairs.map((qa, idx) => ({
      text: qa.text,
      isQA: true,
      type: 'qa',
      qNum: idx + 1,
      answer: qa.answer,
      source: qa.source
    }));
  }

  // Pattern 2: Multiple choice with A) B) C) D) options
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const questionMatch = line.match(/^(?:(\d+)[\.\):]|\*\*(\d+)[\.\):\*]*|Q(\d+)[\.\):]?)\s*(.+?)(?:\?|$)/i);
    
    if (questionMatch) {
      if (currentQ && currentOptions.length > 0) {
        currentQ.options = currentOptions;
        questions.push(currentQ);
      }
      
      questionNum++;
      const qText = questionMatch[4].trim();
      currentQ = { text: qText, options: [], isQuestion: true, type: 'mc', qNum: questionNum };
      currentOptions = [];
    }
    else if (/^[A-D]\s*[\.\)]/i.test(line) && currentQ) {
      const optionMatch = line.match(/^([A-D])\s*[\.\)]\s*(.+?)(?:\s*\(.*\)|$)/i);
      if (optionMatch) {
        const letter = optionMatch[1].toUpperCase();
        const text = optionMatch[2].trim();
        currentOptions.push({ letter, text });
        
        if (/\(correct\)/i.test(line)) {
          if (currentQ) currentQ.correctAnswer = letter;
        }
      }
    }
    else if (/^(?:answer|correct|key)[\s:]*(?:for\s+)?(?:Q\.?|#)?\s*(\d+)?[\s:]*([A-D])/i.test(line) && currentQ) {
      const answerMatch = line.match(/([A-D])/i);
      if (answerMatch && currentQ) {
        currentQ.correctAnswer = answerMatch[1].toUpperCase();
      }
    }
  }

  if (currentQ && currentOptions.length > 0) {
    currentQ.options = currentOptions;
    questions.push(currentQ);
  }

  return questions.length >= 1 ? questions : null;
};

const isQuizContent = (content) => {
  // Check for quiz keywords or structured question formats - very lenient
  const hasQuizKeywords = /quiz|question|multiple choice|a\)|b\)|c\)|d\)|answer|correct/i.test(content);
  const hasNumberedPattern = /^\s*\d+\.\s+[^\n]{10,}/m.test(content);
  const hasOptions = /^\s*[a-d]\s*[\.\)]/im.test(content);
  const hasQAFormat = /^answer:/im.test(content);
  
  // More lenient: detect any numbered questions with potential answers
  if ((hasQuizKeywords || hasNumberedPattern || hasOptions || hasQAFormat) && content.length > 20) {
    const parsed = parseQuizContent(content);
    return parsed && parsed.length > 0 ? parsed : null;
  }
  return null;
};

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE QUIZ COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const InteractiveQuiz = ({ content }) => {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const questions = parseQuizContent(content);

  if (!questions) {
    return <MarkdownMessage content={content} />;
  }

  const isQAFormat = questions[0]?.type === 'qa';

  if (isQAFormat) {
    return (
      <div className="quiz-container qa-format">
        <div className="quiz-header">
          <div className="quiz-title">📚 Study Questions</div>
          <div className="quiz-count">{questions.length} questions</div>
        </div>

        <div className="qa-list">
          {questions.map((q, idx) => (
            <div key={idx} className="qa-card">
              <button
                className="qa-question-btn"
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              >
                <span className="qa-number">{idx + 1}</span>
                <span className="qa-question-text">{q.text}</span>
                <span className={`qa-toggle ${expandedIdx === idx ? 'open' : ''}`}>
                  {expandedIdx === idx ? '−' : '+'}
                </span>
              </button>
              
              {expandedIdx === idx && (
                <div className="qa-answer">
                  <div className="answer-label">✓ Answer</div>
                  <div className="answer-text">{q.answer}</div>
                  {q.source === 'document' && (
                    <div className="source-badge">From Document</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multiple choice format
  return (
    <div className="quiz-container mc-format">
      <div className="quiz-header">
        <div className="quiz-title">🎯 Multiple Choice Quiz</div>
        <div className="quiz-count">{questions.length} questions</div>
      </div>

      <div className="mc-questions">
        {questions.map((q, idx) => (
          <div key={idx} className="mc-question-card">
            <div className="mc-q-header">
              <span className="mc-q-number">Q{idx + 1}</span>
              <span className="mc-q-text">{q.text}</span>
            </div>
            
            <div className="mc-options">
              {q.options?.map((opt, oIdx) => (
                <div key={oIdx} className="mc-option-item">
                  <div className="mc-letter">{opt.letter}</div>
                  <div className="mc-option-text">{opt.text}</div>
                </div>
              ))}
            </div>
            
            {q.correctAnswer && (
              <div className="mc-answer-hint">
                <span className="hint-label">💡 Answer:</span>
                <span className="hint-value">{q.correctAnswer}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PDF VIEWER COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const PDFViewer = ({ fileData, highlightPage }) => {
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!fileData) {
      setPdf(null);
      setTotalPages(0);
      return;
    }

    const loadPdf = async () => {
      try {
        console.log("Loading PDF from ArrayBuffer, size:", fileData.byteLength, "bytes");
        
        // Convert to Uint8Array if necessary
        const uint8 = new Uint8Array(fileData);
        
        const pdf = await pdfjsLib.getDocument(uint8).promise;
        console.log("✓ PDF loaded successfully, pages:", pdf.numPages);
        
        setPdf(pdf);
        setTotalPages(pdf.numPages);
        setPageNum(1);
      } catch (e) {
        console.error("Failed to load PDF:", e);
        setPdf(null);
        setTotalPages(0);
      }
    };

    loadPdf();
  }, [fileData]);

  useEffect(() => {
    if (highlightPage && highlightPage > 0 && highlightPage <= totalPages) {
      setPageNum(highlightPage);
    }
  }, [highlightPage, totalPages]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) {
          console.error("Failed to get 2D context from canvas");
          return;
        }
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render the page
        const renderTask = page.render({ 
          canvasContext: context, 
          viewport: viewport 
        });
        
        await renderTask.promise;
        console.log(`✓ Rendered page ${pageNum}`);
      } catch (e) {
        console.error("Failed to render page:", e);
      }
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  return (
    <div className="pdf-viewer" ref={containerRef}>
      <div className="pdf-header">
        <button
          onClick={() => setPageNum(Math.max(1, pageNum - 1))}
          disabled={pageNum <= 1}
          className="pdf-nav-btn"
        >
          ← Prev
        </button>
        <div className="pdf-page-info">
          Page <input
            type="number"
            min="1"
            max={totalPages}
            value={pageNum}
            onChange={(e) => setPageNum(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
            className="pdf-page-input"
          /> of {totalPages}
        </div>
        <button
          onClick={() => setPageNum(Math.min(totalPages, pageNum + 1))}
          disabled={pageNum >= totalPages}
          className="pdf-nav-btn"
        >
          Next →
        </button>
        <select
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="pdf-zoom"
        >
          <option value={1}>100%</option>
          <option value={1.25}>125%</option>
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
        </select>
      </div>
      <div className="pdf-canvas-container">
        {pdf ? (
          <canvas ref={canvasRef} className="pdf-canvas" />
        ) : (
          <div className="pdf-placeholder">📄 Upload a PDF to view</div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function StudyAssistant({ fileRef, onBackToLanding }) {
  const [doc, setDoc]         = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [highlightPage, setHighlightPage] = useState(null);
  const [status, setStatus]   = useState("idle"); // idle | uploading | ready
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag]       = useState(false);
  const [toast, setToast]     = useState(null);
  const [studyNotes, setStudyNotes] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [explainLevel, setExplainLevel] = useState(() => {
    const saved = localStorage.getItem("lumina-explain-level");
    return saved || "Standard";
  });
  const [studyMode, setStudyMode] = useState(() => {
    const saved = localStorage.getItem("lumina-study-mode");
    return saved || "teach";
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [theme, setTheme]     = useState(() => {
    const saved = localStorage.getItem("lumina-theme");
    return saved || "dark";
  });
  const [expandedMessage, setExpandedMessage] = useState(null);
  const msgsRef  = useRef(null);
  const taRef    = useRef(null);

  /* Initialize theme on mount */
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("lumina-theme", theme);
  }, [theme]);

  /* Persist explain level */
  useEffect(() => {
    localStorage.setItem("lumina-explain-level", explainLevel);
  }, [explainLevel]);

  /* Persist study mode */
  useEffect(() => {
    localStorage.setItem("lumina-study-mode", studyMode);
  }, [studyMode]);

  /* Load bookmarks on mount */
  useEffect(() => {
    if (doc) {
      const key = `lumina_bookmarks_${doc.name || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (e) {
          setBookmarks([]);
        }
      } else {
        setBookmarks([]);
      }
    }
  }, [doc]);

  /* Load recent documents on mount */
  useEffect(() => {
    const saved = localStorage.getItem("lumina_recent_docs");
    if (saved) {
      try {
        setRecentDocs(JSON.parse(saved));
      } catch (e) {
        setRecentDocs([]);
      }
    }
  }, []);

  /* Scroll to bottom on new messages */
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* Format relative date */
  const getRelativeDate = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 30) return `${diff} days ago`;
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  /* Save document to recent list */
  const saveRecentDoc = (fileName) => {
    const newDoc = { name: fileName, date: new Date().toISOString() };
    const updated = [newDoc, ...recentDocs.filter(d => d.name !== fileName)].slice(0, 5);
    setRecentDocs(updated);
    localStorage.setItem("lumina_recent_docs", JSON.stringify(updated));
  };

  /* Re-open a recent document */
  const reopenDocument = (docName) => {
    showToast(`Opening ${docName}...`);
    // Simulate reopening - in a real app, you'd fetch the file
    setDoc({ name: docName });
    setStatus("ready");
    setMessages([]);
  };

  /* Bookmark management */
  const addBookmark = (content, index) => {
    if (!doc) return;
    const bookmark = {
      id: Date.now(),
      content,
      messageIndex: index,
      timestamp: new Date().toISOString(),
    };
    const updated = [...bookmarks, bookmark];
    setBookmarks(updated);
    const key = `lumina_bookmarks_${doc.name || 'default'}`;
    localStorage.setItem(key, JSON.stringify(updated));
    showToast("✓ Bookmark saved!");
  };

  const removeBookmark = (id) => {
    if (!doc) return;
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    const key = `lumina_bookmarks_${doc.name || 'default'}`;
    localStorage.setItem(key, JSON.stringify(updated));
    showToast("✓ Bookmark removed");
  };

  const isBookmarked = (messageIndex) => {
    return bookmarks.some(b => b.messageIndex === messageIndex);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
    showToast(`✦ Switched to ${theme === "dark" ? "light" : "dark"} mode`);
  };

  /* ── File upload ──────────────────────────────────────────────────────── */
  const handleFile = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Only PDF files are supported."); return;
    }
    setDoc(file); setStatus("uploading"); setProgress(0); setMessages([]);

    // Store PDF as ArrayBuffer for pdf.js
    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfData(e.target.result);
    };
    reader.readAsArrayBuffer(file);

    const iv = setInterval(() => {
      setProgress(p => { if (p >= 88) { clearInterval(iv); return p; } return p + Math.random() * 14; });
    }, 180);

    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
      clearInterval(iv); setProgress(100);
      if (!r.ok) throw new Error();
      saveRecentDoc(file.name);
      setStatus("ready"); showToast("✦ Document indexed — ask away!");
    } catch {
      clearInterval(iv); setProgress(100);
      setStatus("ready"); showToast("Demo mode — connect your FastAPI backend");
    }
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };
  const onDragOver = (e) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDrag(false); };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be selected again
    if (fileRef.current) fileRef.current.value = '';
  };

  /* ── Extract page references from text ───────────────────────────────── */
  const extractPageReference = (text) => {
    // Match patterns like "page 5", "p. 10", "pages 3-5", etc.
    const pageMatch = text.match(/(?:page|p\.)\s*(\d+)/i);
    if (pageMatch) {
      return parseInt(pageMatch[1]);
    }
    return null;
  };

  /* ── Get system prompt based on explanation level ──────────────────── */
  const getSystemPrompt = () => {
    const prompts = {
      "Simple": "Explain this in very simple terms. Use short sentences, basic vocabulary, and everyday examples. Avoid technical jargon. Be concise and clear.",
      "Standard": "Provide a clear, balanced explanation. Use appropriate technical terms where relevant. Include examples to illustrate concepts.",
      "Expert": "Provide detailed, technical explanation. Assume the reader has domain expertise. Discuss nuances, edge cases, and advanced considerations. Include references to related concepts."
    };
    return prompts[explainLevel] || prompts["Standard"];
  };

  /* ── Send message ─────────────────────────────────────────────────────── */
  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    if (status !== "ready") { showToast("Upload a PDF first."); return; }

    setMessages(m => [...m, { role: "user", content: q }]);
    setInput("");
    if (taRef.current) { taRef.current.style.height = "auto"; }
    setLoading(true);

    try {
      const r = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, mode: studyMode }),
      });
      const d = await r.json();
      const responseText = d.answer || d.response || "No relevant content found in the document.";
      const pageRef = extractPageReference(responseText);
      if (pageRef) setHighlightPage(pageRef);
      setMessages(m => [...m, {
        role: "ai",
        content: responseText,
        sources: d.sources || d.chunks || [],
      }]);
    } catch {
      const demoResponse = `Demo response for: "${q}"\n\nConnect your FastAPI backend at ${API_BASE}/ask to see real RAG answers.`;
      const pageRef = extractPageReference(demoResponse);
      if (pageRef) setHighlightPage(pageRef);
      setMessages(m => [...m, {
        role: "ai",
        content: demoResponse,
        sources: ["Page 2", "Page 5"],
      }]);
    } finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const onInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── Generate Study Notes ─────────────────────────────────────────────── */
  const generateStudyNotes = async () => {
    if (status !== "ready") { showToast("Upload a PDF first."); return; }
    setGeneratingNotes(true);
    try {
      const r = await fetch(`${API_BASE}/study-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          document: `${doc?.name || "Uploaded Document"} - Generate comprehensive study guide with key concepts, definitions, and practice questions` 
        }),
      });
      
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      
      const d = await r.json();
      const notes = d.notes || d.response || "# Study Notes\n\nNo content generated. Check your Ollama connection.";
      setStudyNotes(notes);
      setShowNotesModal(true);
      showToast("✓ Study notes generated!");
    } catch (err) {
      console.error("Study notes error:", err);
      setStudyNotes(`# Study Notes for "${doc?.name || "Document"}"\n\n## Generation Failed\n**Error:** ${err.message}\n\n## Troubleshooting\n1. Ensure Ollama is running\n2. Check backend logs: \`docker logs lumina-backend\`\n3. Verify vector database has documents indexed`);
      setShowNotesModal(true);
      showToast("⚠ Error generating notes - check backend");
    } finally {
      setGeneratingNotes(false);
    }
  };

  /* ── Download Notes as PDF ──────────────────────────────────────────── */
  const downloadNotesPDF = async () => {
    if (!studyNotes) return;
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      const lineHeight = 7;
      let yPosition = margin;
      
      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(91, 79, 207); // Purple color
      pdf.text("Study Notes", margin, yPosition);
      yPosition += 15;
      
      // Content - split into lines and render
      pdf.setFontSize(11);
      pdf.setTextColor(26, 31, 58); // Dark text
      
      const lines = studyNotes.split('\n');
      for (let line of lines) {
        // Check if page is full
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Handle headers (lines starting with #)
        if (line.startsWith('##')) {
          pdf.setFontSize(13);
          pdf.setTextColor(91, 79, 207);
          const headerText = line.replace(/#+\s*/, '');
          pdf.text(headerText, margin, yPosition);
          yPosition += lineHeight + 2;
          pdf.setFontSize(11);
          pdf.setTextColor(26, 31, 58);
        } else if (line.startsWith('#')) {
          pdf.setFontSize(15);
          pdf.setTextColor(91, 79, 207);
          const headerText = line.replace(/#+\s*/, '');
          pdf.text(headerText, margin, yPosition);
          yPosition += lineHeight + 3;
          pdf.setFontSize(11);
          pdf.setTextColor(26, 31, 58);
        } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          // Bullet points
          const bulletText = line.trim().substring(1).trim();
          const wrappedLines = pdf.splitTextToSize(`• ${bulletText}`, maxWidth);
          pdf.text(wrappedLines, margin + 5, yPosition);
          yPosition += wrappedLines.length * lineHeight;
        } else if (line.trim()) {
          // Regular text
          const wrappedLines = pdf.splitTextToSize(line.trim(), maxWidth);
          pdf.text(wrappedLines, margin, yPosition);
          yPosition += wrappedLines.length * lineHeight;
        } else {
          // Empty line for spacing
          yPosition += 4;
        }
      }
      
      pdf.save(`study-notes-${Date.now()}.pdf`);
      showToast("✓ PDF downloaded!");
    } catch (e) {
      showToast("Failed to generate PDF");
      console.error(e);
    }
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{G}</style>
      <div className="lumina-app">
        {/* Header with Logo and Theme Toggle */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          zIndex: 100
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "1.1rem",
              boxShadow: "0 2px 8px rgba(99,102,241,.2)"
            }}><MdLightbulb size={20} /></div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: "700",
              fontSize: "1.1rem",
              letterSpacing: "-0.3px",
              color: "var(--text)"
            }}>Lumina AI</div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={onBackToLanding}
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                color: "var(--text)",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.25s ease",
                opacity: 0.8
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--surface)";
                e.target.style.opacity = "1";
                e.target.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--elevated)";
                e.target.style.opacity = "0.8";
                e.target.style.borderColor = "var(--border)";
              }}
              title="Back to landing page"
            >
              <FiChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
              <span>Back</span>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                color: "var(--text)",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.25s ease",
                opacity: 0.8
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--surface)";
                e.target.style.opacity = "1";
                e.target.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--elevated)";
                e.target.style.opacity = "0.8";
                e.target.style.borderColor = "var(--border)";
              }}
              title="Upload a new document"
            >
              <FiUploadCloud size={18} />
              <span>Upload PDF</span>
            </button>
            <button
              onClick={toggleTheme}
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                color: "var(--text)",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.25s ease",
                opacity: 0.8
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--surface)";
                e.target.style.opacity = "1";
                e.target.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--elevated)";
                e.target.style.opacity = "0.8";
                e.target.style.borderColor = "var(--border)";
              }}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>
        {/* CHAT - FULL INTEGRATION */}
        <div className="lumina-app-content">
          {/* Left Sidebar - Quick Questions */}
          {status === "ready" && (
            <aside className="lumina-sidebar">
              <div className="quick-suggestions">
                <div className="label">Quick Questions</div>
                <div className="suggestions-grid">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="sug-chip" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                <button
                  className="sug-chip"
                  onClick={generateStudyNotes}
                  disabled={generatingNotes}
                  style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {generatingNotes ? "⟳ Generating..." : <><FiFileText size={16} /> Study Notes</>}
                </button>
              </div>

              {/* Bookmarks Panel */}
              {bookmarks.length > 0 && (
                <div className="bookmarks-panel">
                  <div className="bookmarks-header" onClick={() => setShowBookmarks(!showBookmarks)}>
                    <div className="bookmarks-title">
                      <span><FiBookmark size={14} style={{ display: "inline", marginRight: "4px" }} /> Bookmarks ({bookmarks.length})</span>
                    </div>
                    <button className={`bookmarks-toggle ${showBookmarks ? 'open' : ''}`}>
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                  {showBookmarks && (
                    <div className="bookmarks-list">
                      {bookmarks.map((b, idx) => (
                        <div key={b.id} className="bookmark-item">
                          <div className="bookmark-dot"></div>
                          <div
                            className="bookmark-text"
                            onClick={() => {
                              const el = document.querySelector(`[data-msg-index="${b.messageIndex}"]`);
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            {b.content.substring(0, 80)}...
                          </div>
                          <button
                            className="bookmark-remove"
                            onClick={() => removeBookmark(b.id)}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </aside>
          )}

          {/* Main Chat Area */}
          <main className="l-chat">
          {/* Messages */}
          <div className="messages" ref={msgsRef}>
            {messages.length === 0 ? (
              <div className="empty">
                <div className="e-ring" style={{ fontSize: "0" }}><FiMessageCircle size={32} style={{ position: "absolute" }} /></div>
                <div className="e-title">
                  {status === "ready" ? "What would you like to know?" : "What would you like to study?"}
                </div>
                <div className="e-sub">
                  {status === "ready"
                    ? "Ask questions about your PDF and get instant answers, summaries, and quizzes."
                    : "Upload any PDF — textbook, research paper, or notes — and ask questions, get summaries, or generate a quiz."}
                </div>
                {status !== "ready" && (
                  <>
                    <div
                      className={`drag-drop-zone ${drag ? 'drag-over' : ''}`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => fileRef.current?.click()}
                    >
                      <div className="dz-icon"><FiFile size={28} style={{ color: "white" }} /></div>
                      <div className="dz-content">
                        <div className="dz-main">Drop your PDF here, or click to browse</div>
                        <div className="dz-hint">Supports PDF up to 50MB</div>
                      </div>
                    </div>
                    <div className="landing-suggestions">
                      {LANDING_SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          className="chip-btn"
                          onClick={() => setInput(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {recentDocs.length > 0 && (
                      <div className="recent-docs">
                        <label className="recent-docs-label">Recent Documents</label>
                        <div className="recent-docs-list">
                          {recentDocs.map((doc, idx) => (
                            <div
                              key={idx}
                              className="recent-doc-row"
                              onClick={() => reopenDocument(doc.name)}
                            >
                              <div className="doc-dot"></div>
                              <div className="doc-name">{doc.name}</div>
                              <div className="doc-date">{getRelativeDate(doc.date)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              messages.map((m, i) => {
                const isFromDocument = /^\s*\[FROM\s+DOCUMENT\]/i.test(m.content);
                return (
                <div key={i} className={`msg-row ${m.role}`} data-msg-index={i}>
                  <div className={`avatar ${m.role}`}>{m.role === "ai" ? "L" : "U"}</div>
                  <div className={`bubble ${m.role === "ai" && isFromDocument ? 'from-document' : ''}`} style={{cursor: m.role === "ai" ? "pointer" : "default"}} onClick={() => m.role === "ai" && setExpandedMessage(m)}>
                    {m.role === "ai" ? (
                      (() => {
                        const quizQuestions = isQuizContent(m.content);
                        return quizQuestions ? (
                          <InteractiveQuiz content={m.content} />
                        ) : (
                          <MarkdownMessage content={m.content} isFromDocument={isFromDocument} />
                        );
                      })()
                    ) : (
                      m.content
                    )}
                    {m.role === "ai" && m.sources?.length > 0 && (
                      <div className="sources">
                        <div className="src-label">Sources</div>
                        {m.sources.map((s, j) => (
                          <span key={j} className="src-chip">
                            {typeof s === "string" ? s : s.page || s.source || `Chunk ${j + 1}`}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.role === "ai" && (
                      <button
                        className={`msg-bookmark-btn ${isBookmarked(i) ? 'bookmarked' : ''}`}
                        onClick={() => {
                          if (isBookmarked(i)) {
                            const bookmark = bookmarks.find(b => b.messageIndex === i);
                            if (bookmark) removeBookmark(bookmark.id);
                          } else {
                            addBookmark(m.content, i);
                          }
                        }}
                        title={isBookmarked(i) ? "Remove bookmark" : "Save bookmark"}
                      >
                        {isBookmarked(i) ? <FiBookmark size={16} style={{ fill: "currentColor" }} /> : <FiBookmark size={16} />}
                      </button>
                    )}
                  </div>
                </div>
                );
              })
            )}

            {loading && (
              <div className="thinking-row">
                <div className="avatar ai">⟳</div>
                <div className="think-bubble">
                  Thinking
                  <div className="think-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>

          {/* Explanation Level Toggle */}
          {status === "ready" && (
            <div className="level-toggle-group">
              {["Simple", "Standard", "Expert"].map(level => (
                <button
                  key={level}
                  className={`level-btn ${explainLevel === level ? 'active' : ''}`}
                  onClick={() => setExplainLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          {/* Study Mode Toggle */}
          {status === "ready" && (
            <div className="study-mode-group">
              <button
                className={`mode-btn ${studyMode === 'teach' ? 'active' : ''}`}
                onClick={() => setStudyMode('teach')}
                title="Teaching mode: First principles breakdown"
              >
                <FiBook size={14} /> Teach
              </button>
              <button
                className={`mode-btn ${studyMode === 'visualize' ? 'active' : ''}`}
                onClick={() => setStudyMode('visualize')}
                title="Visualize: Generate diagrams and mental models"
              >
                <FiGitBranch size={14} /> Diagram
              </button>
              <button
                className={`mode-btn ${studyMode === 'duck' ? 'active' : ''}`}
                onClick={() => setStudyMode('duck')}
                title="Duck method: Explain concepts to learn"
              >
                <FiHelpCircle size={14} /> Teach Me
              </button>
            </div>
          )}

          {/* Input */}
          <div className="input-area">
            <div className="input-shell">
              <textarea
                ref={taRef}
                className="chat-input"
                rows={1}
                placeholder={
                  status === "ready"
                    ? "Ask anything about your document…"
                    : "Upload a PDF to start asking questions…"
                }
                value={input}
                onChange={onInput}
                onKeyDown={onKey}
                disabled={status !== "ready" || loading}
              />
              <button
                className="send-btn"
                onClick={() => send()}
                disabled={!input.trim() || status !== "ready" || loading}
              >
                <span className="btn-icon">{loading ? '⟳' : <FiSend size={18} />}</span>
              </button>
            </div>
            <div className="i-hint">
              <kbd>Enter</kbd> to send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> for new line
            </div>
          </div>
          </main>

          {/* PDF Viewer - Right Pane */}
          {status === "ready" && (
            <div className="pdf-pane">
              <PDFViewer fileData={pdfData} highlightPage={highlightPage} />
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* Study Notes Modal */}
      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Study Notes</h2>
              <button className="modal-close" onClick={() => setShowNotesModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body" id="study-notes-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {studyNotes}
              </ReactMarkdown>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowNotesModal(false)}>Close</button>
              <button className="modal-btn download" onClick={downloadNotesPDF}><FiDownload size={16} style={{ marginRight: "6px" }} /> Download as PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Message Modal */}
      {expandedMessage && (
        <div className="modal-overlay" onClick={() => setExpandedMessage(null)}>
          <div className="modal-content expanded-message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Full Response</h2>
              <button className="modal-close" onClick={() => setExpandedMessage(null)}><FiX size={20} /></button>
            </div>
            <div className="modal-body expanded-body">
              <MarkdownMessage content={expandedMessage.content} />
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setExpandedMessage(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        hidden
        onChange={onFileChange}
      />
    </>
  );
}