'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

export const SHAKTIQ_FAQS: FAQItem[] = [
  {
    question: 'How does ShaktIQ detect OpenAPI breaking changes?',
    answer:
      'ShaktIQ parses both the base and candidate OpenAPI specifications into deep Abstract Syntax Trees (AST). It performs deterministic rule validation across all endpoints, methods, parameters, request bodies, and response codes. Changes such as removing an endpoint, changing parameter types, adding required request fields, or altering status codes are flagged with high-precision severity classification (BREAKING, WARNING, INFO).',
  },
  {
    question: 'Which OpenAPI and API schema versions are supported?',
    answer:
      'ShaktIQ supports OpenAPI 3.0.x and OpenAPI 3.1.x, as well as Swagger 2.0 specifications in both YAML and JSON formats. It handles complex JSON Schema references ($ref), polymorphs (oneOf, anyOf, allOf), and custom vendor extensions.',
  },
  {
    question: 'How does the Blast Radius impact calculation work?',
    answer:
      'When an API schema changes, ShaktIQ evaluates the downstream dependencies registered to that endpoint. It computes an impact score based on consumer service tier (Core, Internal, Public SDK), active traffic volume, and the nature of the breaking change. If critical consumers are impacted, the release verdict is automatically shifted to BLOCKED.',
  },
  {
    question: 'How does the Gemini 3.8 Flash AI remediation engine generate fixes?',
    answer:
      'When breaking changes are detected, ShaktIQ feeds the schema AST diff and consumer contract constraints to the Gemini 3.8 Flash engine. Gemini synthesizes a production-grade Release Dossier containing: (1) an executive risk analysis, (2) concrete backward-compatible schema patches, (3) route deprecation strategies, and (4) copy-paste ready migration code.',
  },
  {
    question: 'Can I test ShaktIQ without configuring any external API keys?',
    answer:
      'Yes! ShaktIQ includes built-in mock and sandbox fallback modes. You can compare specs immediately in the interactive console, inspect live AST diffs, and explore sample projects without requiring any GitHub PAT or Gemini API key.',
  },
  {
    question: 'How do GitHub Webhooks work for universal developer workflows?',
    answer:
      'You can register a webhook in any GitHub repository or install the ShaktIQ GitHub App. Whenever any developer pushes a commit or opens a pull request that touches an OpenAPI specification, GitHub dispatches a push/pull_request event to ShaktIQ. ShaktIQ automatically runs the diff, computes the release verdict, and updates the pull request status checks.',
  },
];

export const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[880px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-green-accent" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mb-4">
            Everything you need to know about ShaktIQ
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Deterministic AST comparison, blast radius scoring, CI/CD automation, and Gemini AI remediation.
          </p>
        </div>

        <div className="space-y-4">
          {SHAKTIQ_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-green-dark/12 overflow-hidden shadow-sm hover:border-green-dark/35 hover:shadow-md transition-all duration-200 group"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-base sm:text-lg text-green-dark hover:text-green-mid hover:bg-butter-panel/40 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-green-mid shrink-0 group-hover:scale-110 group-hover:text-green-dark transition-all duration-200" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 transition-all duration-200 ${
                      isOpen ? 'rotate-180 text-green-dark' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-text-dim leading-relaxed border-t border-green-dark/5 bg-butter-panel/40 animate-fade-in">
                    {faq.answer}
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
