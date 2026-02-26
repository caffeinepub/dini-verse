/**
 * Normalizes unknown thrown values (including backend trap / authorization failures)
 * into an English, user-displayable message string for diagnostic UI.
 */
export function formatError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }

  // Handle backend trap errors (often come as objects with various structures)
  if (typeof error === 'object') {
    // Try to extract meaningful information from the error object
    const errorObj = error as Record<string, unknown>;
    
    // Check for common error properties
    if (errorObj.error_description && typeof errorObj.error_description === 'string') {
      return errorObj.error_description;
    }
    
    if (errorObj.error && typeof errorObj.error === 'string') {
      return errorObj.error;
    }

    // Try to stringify if it's a simple object
    try {
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}') {
        return stringified;
      }
    } catch {
      // Ignore stringify errors
    }
  }

  // Fallback
  return 'An unknown error occurred';
}
