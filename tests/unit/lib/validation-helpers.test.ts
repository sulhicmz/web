import { describe, it, expect } from 'vitest';
import { ValidationHelpers, ValidationError } from '../../../src/lib/error-handler';
import { ERROR_MESSAGES } from '../../../src/config';

describe('Validation Helpers', () => {
  describe('required', () => {
    it('should not throw when value is present', () => {
      expect(() => ValidationHelpers.required('value', 'field')).not.toThrow();
      expect(() => ValidationHelpers.required(0, 'field')).not.toThrow();
      expect(() => ValidationHelpers.required(false, 'field')).not.toThrow();
    });

    it('should throw ValidationError when value is null', () => {
      expect(() => ValidationHelpers.required(null, 'testField')).toThrow(ValidationError);
      expect(() => ValidationHelpers.required(null, 'testField')).toThrow('testField wajib diisi');
    });

    it('should throw ValidationError when value is undefined', () => {
      expect(() => ValidationHelpers.required(undefined, 'testField')).toThrow(ValidationError);
      expect(() => ValidationHelpers.required(undefined, 'testField')).toThrow('testField wajib diisi');
    });

    it('should throw ValidationError when value is empty string', () => {
      expect(() => ValidationHelpers.required('', 'testField')).toThrow(ValidationError);
      expect(() => ValidationHelpers.required('', 'testField')).toThrow('testField wajib diisi');
    });

    it('should throw ValidationError with correct field name', () => {
      expect(() => ValidationHelpers.required(null, 'email')).toThrow('email wajib diisi');
      expect(() => ValidationHelpers.required(undefined, 'password')).toThrow('password wajib diisi');
    });
  });

  describe('email', () => {
    it('should not throw for valid email addresses', () => {
      expect(() => ValidationHelpers.email('test@example.com')).not.toThrow();
      expect(() => ValidationHelpers.email('user.name@example.com')).not.toThrow();
      expect(() => ValidationHelpers.email('user+tag@example.co.id')).not.toThrow();
      expect(() => ValidationHelpers.email('test123@domain.org')).not.toThrow();
    });

    it('should throw ValidationError for invalid email formats', () => {
      expect(() => ValidationHelpers.email('invalid')).toThrow(ValidationError);
      expect(() => ValidationHelpers.email('test@')).toThrow(ValidationError);
      expect(() => ValidationHelpers.email('@example.com')).toThrow(ValidationError);
      expect(() => ValidationHelpers.email('test@domain')).toThrow(ValidationError);
      expect(() => ValidationHelpers.email('test@domain.')).toThrow(ValidationError);
      expect(() => ValidationHelpers.email('test domain@example.com')).toThrow(ValidationError);
    });

    it('should throw ValidationError with correct message', () => {
      expect(() => ValidationHelpers.email('invalid')).toThrow(ERROR_MESSAGES.VALIDATION_INVALID_EMAIL);
    });

    it('should throw ValidationError for empty email', () => {
      expect(() => ValidationHelpers.email('')).toThrow(ValidationError);
    });
  });

  describe('phone', () => {
    it('should not throw for valid Indonesian phone numbers', () => {
      expect(() => ValidationHelpers.phone('081234567890')).not.toThrow();
      expect(() => ValidationHelpers.phone('6281234567890')).not.toThrow();
      expect(() => ValidationHelpers.phone('+6281234567890')).not.toThrow();
      expect(() => ValidationHelpers.phone('085789012345')).not.toThrow();
      expect(() => ValidationHelpers.phone('628987654321')).not.toThrow();
    });

    it('should throw ValidationError for invalid phone numbers', () => {
      expect(() => ValidationHelpers.phone('0123456789')).toThrow(ValidationError);
      expect(() => ValidationHelpers.phone('08123')).toThrow(ValidationError);
      expect(() => ValidationHelpers.phone('0812345678901234567890')).toThrow(ValidationError);
      expect(() => ValidationHelpers.phone('+447911123456')).toThrow(ValidationError);
      expect(() => ValidationHelpers.phone('abcdefghijk')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty phone', () => {
      expect(() => ValidationHelpers.phone('')).toThrow(ValidationError);
    });

    it('should throw ValidationError with correct message', () => {
      expect(() => ValidationHelpers.phone('invalid')).toThrow(ERROR_MESSAGES.VALIDATION_INVALID_PHONE);
    });

    it('should not allow numbers starting with invalid prefixes', () => {
      expect(() => ValidationHelpers.phone('06812345678')).toThrow(ValidationError);
      expect(() => ValidationHelpers.phone('07812345678')).toThrow(ValidationError);
      expect(() => ValidationHelpers.phone('09812345678')).toThrow(ValidationError);
    });
  });

  describe('password', () => {
    it('should not throw for strong passwords', () => {
      expect(() => ValidationHelpers.password('Password123')).not.toThrow();
      expect(() => ValidationHelpers.password('MyPass123')).not.toThrow();
      expect(() => ValidationHelpers.password('SecurePass456')).not.toThrow();
    });

    it('should throw ValidationError for passwords less than 8 characters', () => {
      expect(() => ValidationHelpers.password('Pass12')).toThrow(ValidationError);
      expect(() => ValidationHelpers.password('P1ss')).toThrow(ValidationError);
      expect(() => ValidationHelpers.password('p1234567')).toThrow(ValidationError);
    });

    it('should throw ValidationError for passwords without lowercase letters', () => {
      expect(() => ValidationHelpers.password('PASSWORD123')).toThrow(ValidationError);
      expect(() => ValidationHelpers.password('PASSWORD123456')).toThrow(ValidationError);
    });

    it('should throw ValidationError for passwords without uppercase letters', () => {
      expect(() => ValidationHelpers.password('password123')).toThrow(ValidationError);
      expect(() => ValidationHelpers.password('password123456')).toThrow(ValidationError);
    });

    it('should throw ValidationError for passwords without numbers', () => {
      expect(() => ValidationHelpers.password('Password')).toThrow(ValidationError);
      expect(() => ValidationHelpers.password('PasswordTest')).toThrow(ValidationError);
    });

    it('should throw ValidationError with correct message', () => {
      expect(() => ValidationHelpers.password('weak')).toThrow(ERROR_MESSAGES.VALIDATION_PASSWORD_TOO_WEAK);
    });
  });

  describe('passwordConfirmation', () => {
    it('should not throw when passwords match', () => {
      expect(() => ValidationHelpers.passwordConfirmation('Password123', 'Password123')).not.toThrow();
      expect(() => ValidationHelpers.passwordConfirmation('MyPass456', 'MyPass456')).not.toThrow();
    });

    it('should throw ValidationError when passwords do not match', () => {
      expect(() => ValidationHelpers.passwordConfirmation('Password123', 'Password124')).toThrow(ValidationError);
      expect(() => ValidationHelpers.passwordConfirmation('MyPass456', 'mypass456')).toThrow(ValidationError);
      expect(() => ValidationHelpers.passwordConfirmation('Pass123', 'Pass1234')).toThrow(ValidationError);
    });

    it('should throw ValidationError with correct message', () => {
      expect(() => ValidationHelpers.passwordConfirmation('Password123', 'Password124')).toThrow(ERROR_MESSAGES.VALIDATION_PASSWORDS_NOT_MATCH);
    });

    it('should handle empty passwords', () => {
      expect(() => ValidationHelpers.passwordConfirmation('', '')).not.toThrow();
      expect(() => ValidationHelpers.passwordConfirmation('Password123', '')).toThrow(ValidationError);
    });
  });

  describe('minLength', () => {
    it('should not throw when value meets minimum length', () => {
      expect(() => ValidationHelpers.minLength('123', 3, 'field')).not.toThrow();
      expect(() => ValidationHelpers.minLength('12345', 3, 'field')).not.toThrow();
      expect(() => ValidationHelpers.minLength('abcdefghij', 5, 'field')).not.toThrow();
    });

    it('should throw ValidationError when value is shorter than minimum', () => {
      expect(() => ValidationHelpers.minLength('12', 3, 'field')).toThrow(ValidationError);
      expect(() => ValidationHelpers.minLength('a', 5, 'field')).toThrow(ValidationError);
      expect(() => ValidationHelpers.minLength('', 10, 'field')).toThrow(ValidationError);
    });

    it('should include field name in error message', () => {
      expect(() => ValidationHelpers.minLength('12', 3, 'email')).toThrow('email minimal 3 karakter');
      expect(() => ValidationHelpers.minLength('a', 5, 'password')).toThrow('password minimal 5 karakter');
    });

    it('should include exact minimum length in error message', () => {
      expect(() => ValidationHelpers.minLength('a', 10, 'field')).toThrow('field minimal 10 karakter');
      expect(() => ValidationHelpers.minLength('short', 20, 'description')).toThrow('description minimal 20 karakter');
    });
  });

  describe('maxLength', () => {
    it('should not throw when value is within maximum length', () => {
      expect(() => ValidationHelpers.maxLength('123', 5, 'field')).not.toThrow();
      expect(() => ValidationHelpers.maxLength('12345', 5, 'field')).not.toThrow();
      expect(() => ValidationHelpers.maxLength('a', 10, 'field')).not.toThrow();
    });

    it('should throw ValidationError when value exceeds maximum', () => {
      expect(() => ValidationHelpers.maxLength('123456', 5, 'field')).toThrow(ValidationError);
      expect(() => ValidationHelpers.maxLength('abcdefghijk', 10, 'field')).toThrow(ValidationError);
    });

    it('should include field name in error message', () => {
      expect(() => ValidationHelpers.maxLength('123456', 5, 'email')).toThrow('email maksimal 5 karakter');
      expect(() => ValidationHelpers.maxLength('verylongtext', 10, 'password')).toThrow('password maksimal 10 karakter');
    });

    it('should include exact maximum length in error message', () => {
      expect(() => ValidationHelpers.maxLength('toolong', 5, 'field')).toThrow('field maksimal 5 karakter');
      expect(() => ValidationHelpers.maxLength('waytoolongtext', 10, 'description')).toThrow('description maksimal 10 karakter');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings correctly', () => {
      expect(() => ValidationHelpers.required('', 'field')).toThrow();
      expect(() => ValidationHelpers.email('')).toThrow();
      expect(() => ValidationHelpers.phone('')).toThrow();
      expect(() => ValidationHelpers.minLength('', 1, 'field')).toThrow();
    });

    it('should handle whitespace-only strings', () => {
      expect(() => ValidationHelpers.required('   ', 'field')).not.toThrow();
      expect(() => ValidationHelpers.email('   ')).toThrow();
    });

    it('should handle special characters in passwords', () => {
      expect(() => ValidationHelpers.password('P@ssw0rd')).not.toThrow();
      expect(() => ValidationHelpers.password('P#ss1234')).not.toThrow();
    });
  });
});
