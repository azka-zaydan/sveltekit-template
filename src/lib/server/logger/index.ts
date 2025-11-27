import winston from 'winston';
import { createTransports, getLogLevel } from './config';
import { getLogFormat } from './formatters';

/**
 * Main Winston logger instance
 * Server-only - never imported on client side
 */
export const logger = winston.createLogger({
	level: getLogLevel(),
	levels: winston.config.npm.levels, // silly, debug, verbose, http, info, warn, error
	format: getLogFormat(), // Apply format to the logger instance
	transports: createTransports(),
	exitOnError: false
});

/**
 * Logger metadata interface for type safety
 */
export interface LogMetadata {
	requestId?: string;
	userId?: string;
	schema?: 'auth' | 'app' | 'master' | 'public';
	operation?: string;
	duration?: number;
	statusCode?: number;
	path?: string;
	method?: string;
	userAgent?: string;
	ip?: string;
	[key: string]: unknown;
}

/**
 * Type-safe logging helpers
 */
export const log = {
	error: (message: string, meta?: LogMetadata | Error) => {
		if (meta instanceof Error) {
			logger.error(message, { error: meta, stack: meta.stack });
		} else {
			logger.error(message, meta);
		}
	},
	warn: (message: string, meta?: LogMetadata) => logger.warn(message, meta),
	info: (message: string, meta?: LogMetadata) => logger.info(message, meta),
	http: (message: string, meta?: LogMetadata) => logger.http(message, meta),
	debug: (message: string, meta?: LogMetadata) => logger.debug(message, meta)
};

/**
 * Helper to log slow database queries
 */
export function logSlowQuery(queryName: string, duration: number, threshold = 1000) {
	if (duration > threshold) {
		logger.warn('Slow query detected', {
			operation: 'SLOW_QUERY',
			queryName,
			duration,
			threshold
		});
	}
}

/**
 * Helper to log migration operations
 */
export function logMigration(
	action: 'UP' | 'DOWN',
	filename: string,
	duration: number,
	success: boolean
) {
	const level = success ? 'info' : 'error';
	logger.log(level, `Migration ${action.toLowerCase()}: ${filename}`, {
		operation: `MIGRATION_${action}`,
		schema: 'public',
		filename,
		duration,
		success
	});
}

// Export logger instance as default
export default logger;
