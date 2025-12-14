// ...existing code...
import React from 'react';
import { vi } from 'vitest';

// Mock api inside factory to avoid TDZ/hoisting issues
vi.mock('../../utils/api', () => {
  const post = vi.fn();
  return {
    __esModule: true,
    default: { post },
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => {
  const React = require('react');
  return {
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
    Link: ({ children, ...props }) => React.createElement('a', props, children),
  };
});

import api from '../../utils/api';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { AuthContext } from '../../context/AuthContext';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

describe('LoginForm', () => {
  beforeEach(() => {
    api.post.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    // no-op, kept for symmetry/expandability
  });

  it('shows validation error when fields are empty', async () => {
    render(
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <LoginForm />
      </AuthContext.Provider>
    );

    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/please provide email and password/i)).toBeTruthy();
  });

  it('submits credentials, calls login and navigates on success', async () => {
    const fakeToken = 'fake.token.value';
    api.post.mockResolvedValue({ data: { token: fakeToken } });
    const mockLogin = vi.fn();

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <LoginForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@b.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' })
    );

    expect(mockLogin).toHaveBeenCalledWith(fakeToken);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('displays server error message on failure', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });

    render(
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <LoginForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@b.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeTruthy();
  });
});
// ...existing code...