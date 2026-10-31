'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Bot,
  User,
  ShieldAlert,
  Terminal,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { AiQueryResponse } from '@shaktiq/shared';

/**
 * AskAiAssistant Component
 * Interactive natural language AI assistant powered by Google Gemini 3.8 Flash.
 * Allows developers to query project health, breaking changes, and backward-compatible patches.
 */
interface AskAiAssistantProps {
  /** The unique ObjectId string of the active project */
  projectId: string;
  /** Human-readable display name of the project */
  projectName?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  data?: AiQueryResponse;
  timestamp: Date;
}

export function AskAiAssistant({ projectId, projectName }: AskAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Close drawer on Escape key press for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I'm **ShaktIQ AI**, powered by **Google Gemini 3.8 Flash**.\n\nAsk me any natural language question about **${
        projectName || 'this project'
      }** — breaking changes, downstream consumer impact, or backward-compatible code fixes!`,
      timestamp: new Date(),
    },
  ]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const presetQuestions = [
    'Will this release break our mobile apps or consumers?',
    'Give me code fixes for active breaking changes',
    'Which endpoints are recurring hotspots?',
    'Explain the release readiness score',
  ];

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient<AiQueryResponse>(
        `/projects/${projectId}/ai/query`,
        {
          method: 'POST',
          body: JSON.stringify({ question: queryText }),
        },
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        data: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          content: `⚠️ Failed to get an AI answer: ${err.message || 'Network error'}. Please ensure the backend is running.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copySnippet = (snippet: string, index: number) => {
    navigator.clipboard.writeText(snippet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-semibold text-sm rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>Ask ShaktIQ AI</span>
        </button>
      )}

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  ShaktIQ AI Architect
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Gemini 3.8
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {projectName || 'Project Architecture & Release Intelligence'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'assistant',
                      content: `Thread reset. Ask me anything about **${
                        projectName || 'this project'
                      }**!`,
                      timestamp: new Date(),
                    },
                  ])
                }
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-5 py-2.5 bg-white/[0.01] border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none text-xs">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={m.id}
                className={`flex gap-3 text-sm ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-4 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-50 ml-auto'
                      : 'bg-slate-900/80 border border-white/10 text-slate-200'
                  }`}
                >
                  {/* Risk Badge if returned */}
                  {m.data?.riskLevel && (
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          m.data.riskLevel === 'CRITICAL' || m.data.riskLevel === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : m.data.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        Risk: {m.data.riskLevel}
                      </span>
                    </div>
                  )}

                  {/* Main text message */}
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Code Snippet Fix Box */}
                  {m.data?.suggestedFix && (
                    <div className="mt-3 bg-slate-950/90 border border-white/15 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          Backward-Compatible Patch
                        </span>
                        <button
                          onClick={() => copySnippet(m.data!.suggestedFix!, idx)}
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 text-[11px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
                        <code>{m.data.suggestedFix}</code>
                      </pre>
                    </div>
                  )}

                  {/* Related Endpoints Pills */}
                  {m.data?.relatedEndpoints && m.data.relatedEndpoints.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-slate-400">Endpoints:</span>
                      {m.data.relatedEndpoints.map((ep, eIdx) => (
                        <span
                          key={eIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                        >
                          {ep}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engine signature */}
                  {m.data?.generatedBy && (
                    <div className="mt-2 text-[10px] text-slate-500 text-right italic">
                      {m.data.generatedBy}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-white/5 animate-pulse">
                <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Google Gemini 3.8 Flash is analyzing your API topology...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-white/10 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  maxLength={1000}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about breaking changes, fixes, or consumer risk..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl flex items-center justify-center transition-colors shadow-md shadow-emerald-500/10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {input.length > 500 && (
                <div className="text-[10px] text-slate-500 text-right pr-1">
                  {input.length}/1000 characters
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
