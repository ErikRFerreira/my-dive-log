import NewDiveForm from '../components/NewDiveForm';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Dive, NewDiveInput } from '../types';

const { mutateAddMock } = vi.hoisted(() => ({
  mutateAddMock: vi.fn(),
}));

vi.mock('../hooks/useAddDive', () => ({
  useAddDive: () => ({
    isPending: false,
    mutateAdd: mutateAddMock,
  }),
}));

vi.mock('../hooks/useGetLocations', () => ({
  useGetLocations: () => ({
    locations: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NewDiveForm', () => {
  it('does not submit when required fields are missing', async () => {
    mutateAddMock.mockReset();

    render(<NewDiveForm />);

    fireEvent.click(screen.getByRole('button', { name: /save dive/i }));

    // Zod requires location/country_code/depth/duration.
    expect(await screen.findByText(/location is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/select a country/i)).toBeInTheDocument();
    expect(await screen.findByText(/depth is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/duration is required/i)).toBeInTheDocument();

    expect(mutateAddMock).not.toHaveBeenCalled();
  });

  it('filters countries by typing, allows scrolling, and submits country_code', async () => {
    const onSubmit = vi.fn();

    mutateAddMock.mockImplementation(
      (payload: NewDiveInput, options: { onSuccess?: (created: Dive | null) => void }) => {
        expect(payload).toMatchObject({
          date: '2025-01-02',
          locationName: 'Blue Hole',
          locationCountryCode: 'PT',
          depth: 18,
          duration: 35,
        });

        options?.onSuccess?.({
          id: 'dive-1',
          user_id: 'user-1',
          location_id: 'loc-1',
          date: payload.date,
          depth: payload.depth,
          duration: payload.duration,
          notes: payload.notes ?? null,
          summary: null,
          created_at: new Date().toISOString(),
          water_temp: null,
          visibility: null,
          start_pressure: null,
          end_pressure: null,
          air_usage: null,
          equipment: null,
          wildlife: null,
          dive_type: null,
          water_type: null,
          exposure: null,
          gas: null,
          currents: null,
          weight: null,
          locations: {
            id: 'loc-1',
            name: payload.locationName,
            country: payload.locationCountry ?? null,
            country_code: payload.locationCountryCode ?? null,
          },
        } as unknown as Dive);
      }
    );

    render(<NewDiveForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-01-02' } });
    fireEvent.change(screen.getByLabelText(/location\/dive site/i), {
      target: { value: 'Blue Hole' },
    });
    fireEvent.change(screen.getByLabelText(/depth/i), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '35' } });

    const countryInput = screen.getByLabelText(/country/i);
    fireEvent.focus(countryInput);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass('max-h-64');
    expect(listbox).toHaveClass('overflow-y-auto');
    expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(40);

    fireEvent.change(countryInput, { target: { value: 'portu' } });

    const portugalOption = within(screen.getByRole('listbox')).getByRole('option', {
      name: /portugal/i,
    });
    fireEvent.mouseDown(portugalOption);
    fireEvent.click(portugalOption);

    fireEvent.click(screen.getByRole('button', { name: /save dive/i }));

    await waitFor(() => expect(mutateAddMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2025-01-02',
          locationName: 'Blue Hole',
          depth: 18,
          duration: 35,
        })
      )
    );
  });
});
