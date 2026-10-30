import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VerdictBanner } from '../components/shared/VerdictBanner';

describe('VerdictBanner exact copy rules', () => {
  it('renders exact safe label', () => {
    render(<VerdictBanner status="safe" />);
    expect(screen.getByText('Safe based on configured checks')).toBeDefined();
  });

  it('renders exact review label', () => {
    render(<VerdictBanner status="review" />);
    expect(screen.getByText('Warning: review required')).toBeDefined();
  });

  it('renders exact blocked label', () => {
    render(<VerdictBanner status="blocked" />);
    expect(screen.getByText('Not ready: blocking changes detected')).toBeDefined();
  });
});

