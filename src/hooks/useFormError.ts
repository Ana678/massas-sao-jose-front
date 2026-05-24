import { useState } from "react";
import type { FieldErrors } from "@/lib/errorHandling";
import { mapApiErrors } from "@/lib/errorHandling";

/**
 * Hook for managing form field errors
 * Handles both validation errors and API error responses
 */
export function useFormError() {
  const [errors, setErrors] = useState<FieldErrors>({});

  /**
   * Map API error response to field errors
   * @param error The error object from API call
   * @param fieldMapping Optional field name mapping (e.g., { cityId: "city" })
   */
  const mapErrors = (error: any, fieldMapping?: Record<string, string>) => {
    const mapped = mapApiErrors(error, fieldMapping);
    setErrors(mapped);
    return mapped;
  };

  /**
   * Set error for a specific field
   */
  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  /**
   * Clear error for a specific field
   */
  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /**
   * Clear all errors
   */
  const clearAll = () => {
    setErrors({});
  };

  /**
   * Get error for a specific field
   */
  const getError = (field: string) => errors[field];

  /**
   * Check if a field has an error
   */
  const hasError = (field: string) => !!errors[field];

  return {
    errors,
    setErrors,
    mapErrors,
    setFieldError,
    clearError,
    clearAll,
    getError,
    hasError,
  };
}
