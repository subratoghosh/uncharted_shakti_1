'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

type FAQItem = {
  _id?: string;
  id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
};

export const SHAKTIQ_FAQS: FAQItem[] = [
  {
    question: 'How does shaktIQ detect OpenAPI breaking changes?',
    answer:
      'shaktIQ parses both base and candidate OpenAPI specifications into deep Abstract Syntax Trees (AST). It performs deterministic rule validation across all endpoints, methods, parameters, request bodies, and response codes. Changes such as removing an endpoint, changing parameter types, adding required request fields, or altering status codes are flagged with high-precision severity classification (BREAKING, WARNING, INFO).',
    category: 'General',
  },
  {
    question: 'Which OpenAPI and API schema versions are supported?',
    answer:
      'shaktIQ supports OpenAPI 3.0.x and OpenAPI 3.1.x, as well as Swagger 2.0 specifications in both YAML and JSON formats. It handles complex JSON Schema references ($ref), polymorphs (oneOf, anyOf, allOf), and custom vendor extensions.',
    category: 'Compatibility',
  },
  {
    question: 'How does the Blast Radius impact calculation work?',
    answer:
      'When an API schema changes, shaktIQ evaluates downstream dependencies registered to that endpoint. It computes an impact score based on consumer service tier (Core, Internal, Public SDK), active traffic volume, and the nature of the breaking change. If critical consumers are impacted, the release verdict is automatically shifted to BLOCKED.',
    category: 'Security & Risk',
  },
  {
    question: 'How does AI remediation generate backward-compatible fixes?',
    answer:
      'When breaking changes are detected, shaktIQ feeds the schema AST diff and consumer contract constraints to our remediation engine. It synthesizes a production-grade Release Dossier containing: (1) an executive risk analysis, (2) concrete backward-compatible schema patches, (3) route deprecation strategies, and (4) copy-paste ready migration code.',
    category: 'Remediation',
  },
  {
    question: 'Can I test shaktIQ without configuring any external API keys?',
    answer:
      'Yes! shaktIQ includes built-in mock and sandbox fallback modes. You can compare specs immediately in the interactive console, inspect live AST diffs, and explore sample projects without requiring any external keys.',
    category: 'General',
  },
  {
    question: 'How do GitHub Webhooks work for universal developer workflows?',
    answer:
      'You can register a webhook in any GitHub repository or install the shaktIQ GitHub integration. Whenever any developer pushes a commit or opens a pull request that touches an OpenAPI specification, GitHub dispatches an event to shaktIQ. shaktIQ automatically runs the diff, computes the release verdict, and updates status checks.',
    category: 'Integrations',
  },
];

export const FAQAccordion: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>(SHAKTIQ_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Load dynamic FAQs from MongoDB
  useEffect(() => {
    let mounted = true;
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((json) => {
        if (mounted && json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setFaqs(json.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category || 'General').filter(Boolean)))];

  const filteredFaqs = faqs.filter(
    (f) => activeCategory === 'All' || (f.category || 'General') === activeCategory
  );

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-24 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[920px] mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4 border border-green-dark/10">
            <HelpCircle className="w-3.5 h-3.5 text-green-accent" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mb-4 tracking-tight">
            Everything you need to know about <span className="text-green-dark">shakt<span className="text-[#16A34A]">IQ</span></span>
          </h2>
          <p className="text-sm sm:text-base text-text-dim max-w-xl mx-auto">
            Deterministic AST comparison, blast radius scoring, CI/CD automated gates, and backward-compatible code remediation.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-green-dark text-butter-cream shadow-xs'
                      : 'bg-white border border-green-dark/15 text-green-dark hover:bg-butter-warm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || faq._id || idx}
                className="bg-white rounded-2xl border border-green-dark/12 overflow-hidden shadow-xs hover:border-green-dark/30 hover:shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-green-dark hover:text-green-mid hover:bg-butter-panel/40 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-green-mid shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-green-dark' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-text-dim leading-relaxed border-t border-green-dark/5 bg-butter-panel/30 animate-fade-in space-y-3">
                    <p>{faq.answer}</p>
                    {faq.category && (
                      <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium pt-1">
                        <Tag className="w-3 h-3 text-green-accent" />
                        <span>Category: {faq.category}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All FAQ Link */}
        <div className="mt-12 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-sm font-bold text-green-dark hover:text-green-mid transition-colors group"
          >
            <span>Explore full Knowledge Base & Architecture FAQ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
