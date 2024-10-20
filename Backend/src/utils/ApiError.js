class ApiError extends Error {
  constructor(
    statusCode,
    message = "Internal Server Error",
    errors = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;