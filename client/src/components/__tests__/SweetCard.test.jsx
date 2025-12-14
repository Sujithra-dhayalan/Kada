import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SweetCard from '../SweetCard';

describe('SweetCard Component', () => {
    const mockSweet = {
        _id: '1',
        name: 'Chocolate Lava',
        category: 'Cake',
        price: 5.5,
        quantity: 10,
    };

    it('renders sweet details correctly', () => {
        render(<SweetCard sweet={mockSweet} onBuy={() => { }} />);

        expect(screen.getByText('Chocolate Lava')).toBeTruthy();
        expect(screen.getByText('Cake')).toBeTruthy();
        expect(screen.getByText('$5.5')).toBeTruthy();
        expect(screen.getByText('10 left')).toBeTruthy();
        expect(screen.getByRole('button', { name: /buy now/i })).toBeTruthy();
    });

    it('calls onBuy when buy button is clicked', () => {
        const handleBuy = vi.fn();
        render(<SweetCard sweet={mockSweet} onBuy={handleBuy} />);

        const button = screen.getByRole('button', { name: /buy now/i });
        fireEvent.click(button);

        expect(handleBuy).toHaveBeenCalledTimes(1);
        expect(handleBuy).toHaveBeenCalledWith('1');
    });

    it('handles sold out state correctly', () => {
        const soldOutSweet = { ...mockSweet, quantity: 0 };
        render(<SweetCard sweet={soldOutSweet} onBuy={() => { }} />);

        expect(screen.getAllByText('Sold Out')).toHaveLength(2); // Badge and Button
        const button = screen.getByRole('button', { name: /sold out/i });
        expect(button).toBeDisabled();
    });
});
