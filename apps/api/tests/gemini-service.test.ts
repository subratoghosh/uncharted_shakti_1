import { describe, it, expect } from 'vitest';
import { generateMultiLayerDossier } from '../src/modules/ai/gemini-service.js';

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
});
