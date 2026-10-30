import React from 'react';
import type { Metadata } from 'next';
import { MarketingLayout } from '@/components/landing/MarketingLayout';
import { Hero } from '@/components/landing/Hero';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { FeatureModules } from '@/components/landing/FeatureModules';
import { WhyShaktiq } from '@/components/landing/WhyShaktiq';
import { CallToAction } from '@/components/landing/CallToAction';

export const metadata: Metadata = {
  title: 'ShaktIQ — OpenAPI Compatibility & Release Intelligence',
  description:
    'Deterministic OpenAPI breaking change detection, blast radius assessment, and autonomous Gemini AI remediation dossiers for high-velocity API platform teams.',
};

export default function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <TrustStrip />
      <FeatureModules />
      <WhyShaktiq />
      <CallToAction />
    </MarketingLayout>
  );
}
