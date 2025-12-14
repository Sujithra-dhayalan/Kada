import RegisterForm from '../RegisterForm';
import { describe, it, expect } from 'vitest';

describe('RegisterForm', () => {
  it('is a React component (smoke test)', () => {
    expect(typeof RegisterForm).toBe('function');
  });
});
