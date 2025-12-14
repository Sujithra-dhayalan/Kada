import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { BrowserRouter } from 'react-router-dom';

// Global mocks
const mockApi = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
}));

vi.mock('../../utils/api', () => ({
    default: mockApi,
}));

describe('Dashboard Integration Test', () => {
    const mockUser = { username: 'testuser', role: 'user' };
    const mockLogout = vi.fn();
    const mockAddToast = vi.fn();

    const mockSweets = [
        { _id: '1', name: 'Macaron', category: 'Pastry', price: 2.0, quantity: 5 },
        { _id: '2', name: 'Cheesecake', category: 'Cake', price: 4.5, quantity: 0 },
    ];

    const renderDashboard = () => {
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
                    <ToastContext.Provider value={{ addToast: mockAddToast }}>
                        <Dashboard />
                    </ToastContext.Provider>
                </AuthContext.Provider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders dashboard and fetches sweets', async () => {
        mockApi.get.mockResolvedValueOnce({ data: mockSweets });

        renderDashboard();

        expect(screen.getByText(/available sweets/i)).toBeTruthy();
        // Should show loading initially
        expect(screen.getByText(/loading sweets/i)).toBeTruthy();

        // Wait for sweets to load
        await waitFor(() => {
            expect(screen.getByText('Macaron')).toBeTruthy();
            expect(screen.getByText('Cheesecake')).toBeTruthy();
        });

        expect(screen.getByText('$2')).toBeTruthy(); // 2.0 -> 2 usually
        expect(screen.getAllByText('Sold Out')).toBeTruthy(); // For Cheesecake
    });

    it('handles search functionality', async () => {
        // Initial load
        mockApi.get.mockResolvedValueOnce({ data: mockSweets });
        // Search call
        mockApi.get.mockResolvedValueOnce({ data: [mockSweets[0]] });

        renderDashboard();

        await waitFor(() => expect(screen.getByText('Macaron')).toBeTruthy());

        const searchInput = screen.getByPlaceholderText(/sweet name/i);
        fireEvent.change(searchInput, { target: { value: 'Macaron' } });

        const searchButton = screen.getByRole('button', { name: /search/i });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/sweets/search?name=Macaron'));
        });

        // In a real integration, the UI would update. Here we are confident api was called.
    });

    it('handles purchase flow', async () => {
        mockApi.get.mockResolvedValue({ data: mockSweets });
        mockApi.post.mockResolvedValue({ data: { success: true } });

        renderDashboard();

        await waitFor(() => expect(screen.getByText('Macaron')).toBeTruthy());

        // Buy Macaron
        const buyButtons = screen.getAllByRole('button', { name: /buy now/i });
        fireEvent.click(buyButtons[0]);

        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/sweets/1/purchase');
            expect(mockAddToast).toHaveBeenCalledWith('Yum! Sweet purchased.', 'success');
        });

        // Should re-fetch sweets after purchase
        expect(mockApi.get).toHaveBeenCalledTimes(2); // 1 initial + 1 refresh
    });

    it('displays error if purchase fails', async () => {
        mockApi.get.mockResolvedValue({ data: mockSweets });
        mockApi.post.mockRejectedValue({ response: { data: { error: 'Not enough money' } } });

        renderDashboard();

        await waitFor(() => expect(screen.getByText('Macaron')).toBeTruthy());

        const buyButtons = screen.getAllByRole('button', { name: /buy now/i });
        fireEvent.click(buyButtons[0]);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Not enough money', 'error');
        });
    });
});
