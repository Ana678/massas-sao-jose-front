/**
 * Generic error handler for API responses
 * Supports multiple API error formats and converts them to field-level errors
 */

export interface FieldErrors {
  [key: string]: string;
}

export function mapApiErrors(
  error: any,
  fieldMapping?: Record<string, string>
): FieldErrors {
  const data = error?.response?.data;
  if (!data) return {};

  const mapped: FieldErrors = {};

  const assignError = (field: string, message: unknown) => {
    const target = fieldMapping?.[field] ?? field;
    if (typeof message === "string") {
      mapped[target] = message;
      return;
    }
    if (Array.isArray(message) && message.length > 0 && typeof message[0] === "string") {
      mapped[target] = message[0];
    }
  };

  if (data.fieldErrors && typeof data.fieldErrors === "object" && !Array.isArray(data.fieldErrors)) {
    for (const [field, message] of Object.entries(data.fieldErrors)) {
      assignError(field, message);
    }
  }

  if (Array.isArray(data.errors)) {
    for (const issue of data.errors) {
      const field = issue?.path?.[0];
      if (typeof field === "string") {
        assignError(field, issue?.message);
      }
    }
  }

  if (Array.isArray(data.issues)) {
    for (const issue of data.issues) {
      const field = issue?.path?.[0];
      if (typeof field === "string") {
        assignError(field, issue?.message);
      }
    }
  }

  return mapped;
}

/**
 * Get a single field error message
 */
export function getFieldError(errors: FieldErrors, field: string): string | undefined {
  return errors[field];
}

/**
 * Check if a field has an error
 */
export function hasFieldError(errors: FieldErrors, field: string): boolean {
  return !!errors[field];
}

/**
 * Clear error for a specific field
 */
export function clearFieldError(errors: FieldErrors, field: string): FieldErrors {
  const next = { ...errors };
  delete next[field];
  return next;
}

/**
 * Clear all errors
 */
export function clearAllErrors(): FieldErrors {
  return {};
}
