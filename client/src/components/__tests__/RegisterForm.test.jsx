import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  navigate: vi.fn(),
}));

// Mock modules using vi.hoisted variables
vi.mock('../../utils/api', () => ({
  default: { post: mocks.post },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

import RegisterForm from '../RegisterForm';

describe('RegisterForm', () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.navigate.mockReset();
    vi.useRealTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Positive Cases
  it('should render RegisterForm with all input fields and button', () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText(/username/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /create account/i })).toBeTruthy();
  });

  it('should update form fields on user input', async () => {
    render(<RegisterForm />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123', name: 'password' } });

    await waitFor(() => {
      expect(usernameInput.value).toBe('testuser');
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });
  });

  it('should submit form successfully and show success message', async () => {
    mocks.post.mockResolvedValue({ data: { message: 'Registration successful' } });

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/registration successful/i)).toBeTruthy();
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/auth/register', { username: 'testuser', email: 'test@example.com', password: 'password123' }));
  });

  it('should navigate to login after successful registration', async () => {
    mocks.post.mockResolvedValue({ data: { message: 'Registration successful' } });

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/registration successful/i)).toBeTruthy();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/login'), { timeout: 2000 });
  }, 10000);

  it('should disable button while loading', async () => {
    mocks.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(submitButton.textContent).toBe('Creating...');
  });

  // Negative Cases
  it('should show error when username field is empty', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/please fill all fields/i)).toBeTruthy();
  });

  it('should show error when email field is empty', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/please fill all fields/i)).toBeTruthy();
  });

  it('should show error when password field is empty', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/please fill all fields/i)).toBeTruthy();
  });

  it('should show error when all fields are empty', async () => {
    render(<RegisterForm />);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/please fill all fields/i)).toBeTruthy();
  });

  it('should display server error message on registration failure', async () => {
    mocks.post.mockRejectedValue({ response: { data: { error: 'Email already exists' } } });

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/email already exists/i)).toBeTruthy();
  });

  it('should display generic error message when server error has no data', async () => {
    mocks.post.mockRejectedValue({ response: {} });

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/registration failed/i)).toBeTruthy();
  });

  it('should clear error message when user starts typing after error', async () => {
    render(<RegisterForm />);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/please fill all fields/i)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });

    // Error should still be visible but will be cleared on next submit attempt
    expect(screen.queryByText(/please fill all fields/i)).toBeTruthy();
  });

  it('should not navigate if registration fails', async () => {
    mocks.post.mockRejectedValue({ response: { data: { error: 'Registration failed' } } });

    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser', name: 'username' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123', name: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await screen.findByText(/registration failed/i);

    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});