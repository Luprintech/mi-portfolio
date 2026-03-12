export function createHttpError(statusCode, publicMessage, options = {}) {
    const error = options.cause instanceof Error
        ? options.cause
        : new Error(publicMessage);

    error.statusCode = statusCode;
    error.publicMessage = publicMessage;

    if (options.code) {
        error.code = options.code;
    }

    return error;
}
