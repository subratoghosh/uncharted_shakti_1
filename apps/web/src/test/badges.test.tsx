import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SeverityBadge } from '../components/shared/SeverityBadge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DiffStatusBadge } from '../components/shared/DiffStatusBadge';
import { EndpointTag } from '../components/shared/EndpointTag';

describe('Shared badge components', () => {
  it('renders SeverityBadge correctly', () => {
    const { rerender } = render(<SeverityBadge severity="breaking" />);
    expect(screen.getByText('Breaking')).toBeDefined();

    rerender(<SeverityBadge severity="warning" />);
    expect(screen.getByText('Warning')).toBeDefined();

    rerender(<SeverityBadge severity="info" />);
    expect(screen.getByText('Info')).toBeDefined();
  });

  it('renders StatusBadge with accessible labels', () => {
    const { rerender } = render(<StatusBadge status="running" />);
    expect(screen.getByText('Running')).toBeDefined();

    rerender(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeDefined();

    rerender(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeDefined();
  });

  it('renders DiffStatusBadge with correct classifications', () => {
    const { rerender } = render(<DiffStatusBadge status="new" />);
    expect(screen.getByText('New')).toBeDefined();

    rerender(<DiffStatusBadge status="resolved" />);
    expect(screen.getByText('Resolved')).toBeDefined();

    rerender(<DiffStatusBadge status="unresolved" />);
    expect(screen.getByText('Unresolved')).toBeDefined();
  });

  it('renders EndpointTag in monospace with method and path', () => {
    render(<EndpointTag method="DELETE" path="/orders/{id}" />);
    expect(screen.getByText('DELETE')).toBeDefined();
    expect(screen.getByText('/orders/{id}')).toBeDefined();
  });
});
