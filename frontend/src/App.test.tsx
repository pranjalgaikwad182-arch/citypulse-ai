import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PlaceCard } from './components/PlaceCard';
import { ToastContainer } from './components/Toast';
import { Place } from './types';

describe('PlaceCard Component', () => {
  const mockPlace: Place = {
    id: 1,
    name: 'Shaniwar Wada',
    category: 'Heritage',
    subcategory: 'Historical Fort',
    address: 'Shaniwar Peth, Pune',
    lat: 18.5196,
    lng: 73.8553,
    avg_cost_inr: 25,
    rating: 4.5,
    reviews_count: 14000,
    accessibility_wheelchair: false,
    is_family_friendly: true,
    description: 'Peshwa residence built in 1732.',
    source_name: 'Pune Open Data',
    data_freshness: 'Verified 2026',
    created_at: new Date().toISOString(),
  };

  it('renders place name, category, and budget accurately', () => {
    render(<PlaceCard place={mockPlace} />);
    expect(screen.getByText('Shaniwar Wada')).toBeDefined();
    expect(screen.getByText('Heritage')).toBeDefined();
    expect(screen.getByText('₹25')).toBeDefined();
    expect(screen.getByText('Family Friendly')).toBeDefined();
  });
});

describe('ToastContainer Component', () => {
  it('renders toast notifications properly', () => {
    render(
      <ToastContainer
        toasts={[
          {
            id: '1',
            title: 'Report Submitted',
            message: 'Incident registered.',
            type: 'success',
          },
        ]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText('Report Submitted')).toBeDefined();
    expect(screen.getByText('Incident registered.')).toBeDefined();
  });
});
