import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock jwt-decode to return a predictable decoded payload
vi.mock('jwt-decode', () => ({ default: (t) => ({ id: 'u1', name: 'Test User', token: t }) }));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('login stores token and decodes user', async () => {
    const TestChild = () => {
      const { user, token, login, logout } = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
          <div data-testid="token">{token || 'null'}</div>
          <button onClick={() => login('tok-123')}>login</button>
          <button onClick={() => logout()}>logout</button>
        </div>
      );
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      </MemoryRouter>
    );

    // initially no token/user
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(localStorage.getItem('token')).toBe('tok-123'));
    expect(screen.getByTestId('token').textContent).toBe('tok-123');
    expect(screen.getByTestId('user').textContent).toContain('Test User');

    // logout clears
    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
});
