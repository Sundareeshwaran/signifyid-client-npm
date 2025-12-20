/**
 * @signifyid/client - Error Classes
 *
 * Custom error classes for Signify iD authentication errors.
 *
 * @packageDocumentation
 */

import type { SignifyError } from "./types";

// Extend ErrorConstructor to include V8's captureStackTrace
declare global {
  interface ErrorConstructor {
    captureStackTrace?(targetObject: object, constructorOpt?: Function): void;
  }
}

/**
 * Custom error class for Signify iD authentication errors
 *
 * @example
 * ```ts
 * throw new SignifyAuthError("INVALID_TOKEN", "Access token has expired");
 * ```
 */
export class SignifyAuthError extends Error {
  /** Error code for programmatic handling */
  code: string;
  /** Additional error details */
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "SignifyAuthError";
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 engines only)
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, SignifyAuthError);
    }
  }

  /**
   * Convert to plain SignifyError object
   */
  toJSON(): SignifyError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Parse any error into a SignifyError object
 */
export function parseAuthError(error: unknown): SignifyError {
  if (error instanceof SignifyAuthError) {
    return error.toJSON();
  }
  if (error instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: error.message };
  }
  if (typeof error === "string") {
    return { code: "UNKNOWN_ERROR", message: error };
  }
  return { code: "UNKNOWN_ERROR", message: "An unknown error occurred" };
}
