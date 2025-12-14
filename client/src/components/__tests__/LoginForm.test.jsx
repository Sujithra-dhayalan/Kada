import LoginForm from '../LoginForm';
import { describe, it, expect } from 'vitest';

describe('LoginForm', () => {
  it('is a React component (smoke test)', () => {
    expect(typeof LoginForm).toBe('function');
  });
});
