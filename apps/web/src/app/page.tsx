import React from 'react';
import type { Metadata } from 'next';
import { MarketingLayout } from '@/components/landing/MarketingLayout';
import { Hero } from '@/components/landing/Hero';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { FeatureModules } from '@/components/landing/FeatureModules';
import { WhyShaktiq } from '@/components/landing/WhyShaktiq';
import { CallToAction } from '@/components/landing/CallToAction';

export const metadata: Metadata = {
  title: 'shaktIQ — Release Safety & Compatibility Governance',
  description:
    'Deterministic breaking change prevention, downstream client impact assessment, and automated patch remediation dossiers for modern engineering teams.',
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
