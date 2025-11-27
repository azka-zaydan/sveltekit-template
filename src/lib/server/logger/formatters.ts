import { env } from '$env/dynamic/private';
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Redact sensitive fields from metadata
 * Applies to both development and production formats to prevent credential exposure
 *
 * SECURITY: Always add new sensitive field names here to ensure they're never logged
 */
function redactSensitiveData(key: string, value: unknown): unknown {
	if (['password', 'token', 'sessionToken', 'apiKey', 'secret'].includes(key)) {
		return '[REDACTED]';
	}
	return value;
}

/**
 * Development format - colorized console output with pretty formatting
 * Now includes redaction of sensitive fields
 */
export const developmentFormat = combine(
	colorize({ all: true }),
	timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	errors({ stack: true }),
	printf((info): string => {
		const { timestamp, level, message, requestId, userId, operation, schema, duration, ...meta } =
			info as Record<string, unknown>;

		// Base log line
		let logLine = `[${timestamp}] ${level}: ${message}`;

		// Add context if available
		if (requestId) logLine += `\n  requestId: ${requestId}`;
		if (userId) logLine += `\n  userId: ${userId}`;
		if (operation) logLine += `\n  operation: ${operation}`;
		if (schema) logLine += `\n  schema: ${schema}`;
		if (duration !== undefined) logLine += `\n  duration: ${duration}ms`;

		// Add remaining metadata with redaction
		const metaKeys = Object.keys(meta);
		if (metaKeys.length > 0) {
			metaKeys.forEach((key) => {
				// Skip Winston internals
				if (!['level', 'message', 'splat', 'stack'].includes(key)) {
					const value = redactSensitiveData(key, meta[key]);
					if (typeof value === 'object') {
						// Apply redaction to nested objects
						const redacted = JSON.stringify(value, (k, v) => redactSensitiveData(k, v), 2);
						logLine += `\n  ${key}: ${redacted.split('\n').join('\n  ')}`;
					} else {
						logLine += `\n  ${key}: ${value}`;
					}
				}
			});
		}

		// Add stack trace if error
		if (info.stack) {
			logLine += `\n${info.stack}`;
		}

		return logLine;
	})
);

/**
 * Production format - JSON output for log aggregation services
 * Uses shared redaction function for consistency
 */
export const productionFormat = combine(
	timestamp(),
	errors({ stack: true }),
	json({
		replacer: (key, value) => redactSensitiveData(key, value)
	})
);

/**
 * Get format based on environment
 */
export function getLogFormat() {
	const nodeEnv = env.NODE_ENV || 'development';
	return nodeEnv === 'production' ? productionFormat : developmentFormat;
}
