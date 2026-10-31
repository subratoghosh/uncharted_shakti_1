import { describe, it, expect } from 'vitest';
import { generateMultiLayerDossier, queryProjectAssistant } from '../src/modules/ai/gemini-service.js';

describe('Gemini AI Multi-Layer Dossier Service', () => {
  it('generates deterministic fallback dossier when findings contain breaking changes', async () => {
    const findings = [
      {
        endpoint: '/orders/{id}',
        method: 'DELETE',
        changeType: 'endpoint_removed',
        severity: 'breaking',
        description: 'Endpoint DELETE /orders/{id} was removed',
        impact: 'Client applications calling DELETE /orders/{id} will receive 404',
        recommendation: 'Mark endpoint as deprecated before deletion',
      },
      {
        endpoint: '/orders',
        method: 'POST',
        changeType: 'request_property_required_added',
        severity: 'breaking',
        description: 'New required property paymentMethodId added',
        impact: 'Older clients without paymentMethodId will be rejected',
        recommendation: 'Provide default value or keep property optional',
      },
    ];

    const dossier = await generateMultiLayerDossier('Orders Service', 'v2.0.0', findings, 2);

    expect(dossier).toBeDefined();
    expect(dossier.releaseScore).toBeLessThanOrEqual(40);
    expect(dossier.verdictLabel).toContain('BLOCKED');
    expect(dossier.blastRadius.mobileAppsRisk).toBe('CRITICAL');
    expect(dossier.findingInsights).toHaveLength(2);
    expect(dossier.findingInsights[0].codeFixSnippet).toBeDefined();
    expect(dossier.executiveActionPlan.length).toBeGreaterThan(0);
    expect(dossier.stakeholderNotes.techLead).toBeDefined();
  });

  it('generates high release score when no breaking changes are present', async () => {
    const findings = [
      {
        endpoint: '/orders',
        method: 'GET',
        changeType: 'response_property_added',
        severity: 'info',
        description: 'New optional property trackingUrl added to response',
        impact: 'Backward compatible addition',
        recommendation: 'Safe to release',
      },
    ];

    const dossier = await generateMultiLayerDossier('Orders Service', 'v1.1.0', findings, 0);

    expect(dossier).toBeDefined();
    expect(dossier.releaseScore).toBeGreaterThanOrEqual(70);
    expect(dossier.verdictLabel).toContain('SAFE FOR DEPLOYMENT');
    expect(dossier.blastRadius.mobileAppsRisk).toBe('LOW');
  });

  describe('queryProjectAssistant', () => {
    it('generates actionable answer with critical risk when breaking changes exist', async () => {
      const result = await queryProjectAssistant({
        projectName: 'Payment Gateway API',
        question: 'Are there any breaking changes that could affect our mobile app?',
        runsSummary: [
          {
            version: 'v2.1.0',
            status: 'completed',
            releaseStatus: 'blocked',
            breakingCount: 1,
            warningCount: 0,
            createdAt: new Date().toISOString(),
          },
        ],
        recentFindings: [
          {
            endpoint: '/v1/charges',
            method: 'POST',
            changeType: 'request_property_required_added',
            severity: 'breaking',
            description: 'New required field currencyCode added',
            impact: 'Clients not sending currencyCode will receive 400 Bad Request',
            recommendation: 'Make currencyCode optional with default USD',
          },
        ],
        hotspots: [{ endpoint: '/v1/charges', count: 3 }],
      });

      expect(result).toBeDefined();
      expect(result.answer).toBeTruthy();
      expect(result.riskLevel).toBe('CRITICAL');
      expect(result.relatedEndpoints).toContain('/v1/charges');
      expect(result.suggestedFix).toBeDefined();
      expect(result.generatedBy).toBeTruthy();
    });

    it('generates safe assessment when recent findings contain no breaking changes', async () => {
      const result = await queryProjectAssistant({
        projectName: 'Catalog API',
        question: 'Is it safe to release to production?',
        runsSummary: [
          {
            version: 'v1.4.0',
            status: 'completed',
            releaseStatus: 'safe',
            breakingCount: 0,
            warningCount: 0,
            createdAt: new Date().toISOString(),
          },
        ],
        recentFindings: [],
        hotspots: [],
      });

      expect(result).toBeDefined();
      expect(result.answer).toContain('backward-compatible');
      expect(result.riskLevel).toBe('SAFE');
      expect(result.relatedEndpoints).toHaveLength(0);
    });
  });
});

