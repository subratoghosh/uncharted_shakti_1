'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

type FAQItem = {
  _id: string;
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  createdAt?: string;
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [order, setOrder] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faqs');
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        setFaqs(json.data);
      }
    } catch {
      setFeedback({ type: 'err', message: 'Failed to load FAQs from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openAddModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory('General');
    setOrder(faqs.length + 1);
    setShowModal(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || 'General');
    setOrder(faq.order ?? 10);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingFaq) {
        // Edit existing FAQ
        const res = await fetch(`/api/admin/faqs/${editingFaq._id || editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, answer, category, order }),
        });
        if (!res.ok) throw new Error('Failed to update FAQ');
        setFeedback({ type: 'ok', message: 'FAQ updated successfully!' });
      } else {
        // Create new FAQ
        const res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, answer, category, order }),
        });
        if (!res.ok) throw new Error('Failed to create FAQ');
        setFeedback({ type: 'ok', message: 'New FAQ added to knowledge base!' });
      }

      setShowModal(false);
      await fetchFaqs();
    } catch (err: unknown) {
      setFeedback({ type: 'err', message: (err as Error).message || 'Action failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to permanently delete this FAQ?')) return;

    setDeletingId(faqId);
    try {
      const res = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      setFeedback({ type: 'ok', message: 'FAQ removed from knowledge base.' });
      setFaqs((prev) => prev.filter((f) => (f._id || f.id) !== faqId));
    } catch (err: unknown) {
      setFeedback({ type: 'err', message: (err as Error).message || 'Failed to delete FAQ.' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 text-green-dark max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-dark text-butter-cream flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-butter-gold" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-green-dark">
              Knowledge FAQ Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Add, update, or remove live FAQs displayed on the public Knowledge Base page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFaqs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-butter-panel hover:bg-butter-warm text-green-dark transition-colors"
            title="Refresh FAQs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-dark text-butter-cream font-bold text-xs sm:text-sm hover:bg-green-deep transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-butter-gold" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fade-in ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FAQs List Table / Cards */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 bg-butter-panel border-b border-border flex items-center justify-between text-xs font-bold text-green-dark">
          <span>Active FAQs ({faqs.length})</span>
          <span className="text-text-muted font-normal">Sorted by display order</span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-green-mid mx-auto" />
            <p className="text-xs text-text-muted">Loading FAQs from database...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center space-y-3 text-text-muted">
            <HelpCircle className="w-8 h-8 text-green-mid mx-auto opacity-50" />
            <p className="text-sm font-semibold text-green-dark">No FAQs in database</p>
            <p className="text-xs">Click &quot;Add New FAQ&quot; to add your first question.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {faqs.map((faq) => (
              <div
                key={faq._id || faq.id}
                className="p-5 sm:p-6 hover:bg-butter-panel/40 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-butter-warm text-[10px] font-mono font-bold text-green-dark border border-green-dark/15">
                      #{faq.order ?? 10}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      <Tag className="w-2.5 h-2.5 text-emerald-600" />
                      {faq.category || 'General'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-green-dark">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg border border-border hover:bg-butter-warm text-green-dark transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id || faq.id)}
                    disabled={deletingId === (faq._id || faq.id)}
                    className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors disabled:opacity-50"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-green-dark">
                {editingFaq ? 'Edit FAQ' : 'Add New Knowledge FAQ'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-butter-panel text-text-muted hover:text-green-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-green-dark">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does OpenAPI contract diffing work?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs sm:text-sm text-green-dark focus:ring-1 focus:ring-green-mid"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-green-dark">Answer</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide a comprehensive and clear explanation..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3 rounded-lg bg-butter-panel border border-border text-xs sm:text-sm text-green-dark leading-relaxed focus:ring-1 focus:ring-green-mid"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-green-dark">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs sm:text-sm text-green-dark font-medium"
                  >
                    <option value="General">General</option>
                    <option value="Compatibility">Compatibility</option>
                    <option value="Security & Risk">Security & Risk</option>
                    <option value="Remediation">Remediation</option>
                    <option value="Integrations">Integrations</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-green-dark">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-butter-panel border border-border text-xs sm:text-sm text-green-dark"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-butter-panel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-green-dark text-butter-cream hover:bg-green-deep transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingFaq ? 'Save Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
