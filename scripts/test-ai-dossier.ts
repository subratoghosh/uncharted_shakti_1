/**
 * CLI Test Script for ShaktIQ Multi-Layer AI Release Intelligence
 * Run with: npx tsx scripts/test-ai-dossier.ts
 */

import { generateMultiLayerDossier } from '../apps/api/src/modules/ai/gemini-service.js';

async function main() {
  console.log('🤖 Initializing ShaktIQ Multi-Layer AI Dossier Generator...');

  const mockFindings = [
    {
      endpoint: '/checkout',
      method: 'POST',
      changeType: 'REQUEST_BODY_TYPE_CHANGED',
      severity: 'breaking',
      description: 'Field cartId changed from string to integer in request payload',
      impact: 'All current web and mobile clients sending cartId as UUID string will be rejected with HTTP 422',
      recommendation: 'Allow cartId to accept either string or integer using oneOf/anyOf union',
    },
    {
      endpoint: '/checkout/{id}',
      method: 'GET',
      changeType: 'ENDPOINT_REMOVED',
      severity: 'breaking',
      description: 'Session query endpoint removed entirely without deprecation period',
      impact: 'Clients polling for order confirmation will receive HTTP 404',
      recommendation: 'Retain /checkout/{id} with Deprecated header for at least 60 days',
    },
    {
      endpoint: '/checkout',
      method: 'POST',
      changeType: 'HEADER_REQUIRED',
      severity: 'warning',
      description: 'X-Idempotency-Key header is now mandatory for payment creation',
      impact: 'Legacy clients not passing the idempotency key may fail retry validation',
      recommendation: 'Make header optional during migration window and default to auto-generated UUID',
    },
  ];

  const startTime = Date.now();
  const dossier = await generateMultiLayerDossier('Checkout & Payment Service', '2.0.0', mockFindings, 1);
  const elapsed = Date.now() - startTime;

  console.log('\n======================================================');
  console.log('📑 SHAKTIQ MULTI-LAYER RELEASE INTELLIGENCE DOSSIER');
  console.log('======================================================');
  console.log(`⏱️ Generation Latency: ${elapsed}ms`);
  console.log(`🤖 Engine: ${dossier.generatedBy}`);
  console.log(`🎯 Executive Verdict: [${dossier.verdictLabel}]`);
  console.log(`📊 Release Score: ${dossier.releaseScore} / 100`);
  console.log(`📝 Summary: ${dossier.verdictDescription}\n`);

  console.log('--- LAYER 2: CONSUMER BLAST RADIUS ---');
  console.log(`📱 Mobile Apps:       ${dossier.blastRadius.mobileAppsRisk}`);
  console.log(`💻 Web Frontend:      ${dossier.blastRadius.webFrontendRisk}`);
  console.log(`⚙️ Microservices:     ${dossier.blastRadius.microservicesRisk}`);
  console.log(`🌐 3rd-Party/Tokens:  ${dossier.blastRadius.thirdPartyRisk}`);
  console.log(`📌 Radius Context:    ${dossier.blastRadius.summary}\n`);

  console.log(`--- LAYER 3: CODE REMEDIATION (${dossier.findingInsights.length} patches) ---`);
  dossier.findingInsights.forEach((fi, i) => {
    console.log(`[Patch ${i + 1}] ${fi.method} ${fi.endpoint} (${fi.changeType})`);
    console.log(`   Impact: ${fi.consumerImpact}`);
    console.log(`   Strategy: ${fi.mitigationStrategy}`);
  });

  console.log('\n--- LAYER 4: STAKEHOLDER DIRECTIVES ---');
  console.log(`👥 Tech Lead: ${dossier.stakeholderNotes.techLead}`);
  console.log(`🛡️ QA Engineering: ${dossier.stakeholderNotes.qaEngineering}`);
  console.log(`💼 Product Owner: ${dossier.stakeholderNotes.productOwner}`);

  console.log('\n✅ AI Dossier CLI test successfully passed!\n');
}

main().catch((err) => {
  console.error('❌ Failed to run AI dossier test:', err);
  process.exit(1);
});
