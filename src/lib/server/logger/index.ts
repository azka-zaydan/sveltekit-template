import winston from 'winston';
import { createTransports, getLogLevel } from './config';
import { getLogFormat } from './formatters';

/**
 * Winston logger instance
 * Uses npm log levels: silly, debug, verbose, http, info, warn, error
 */
const logger = winston.createLogger({
	level: getLogLevel(),
	levels: winston.config.npm.levels,
	format: getLogFormat(),
	transports: createTransports()
});

/**
 * Structured log metadata interface
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
	error: (message: string, meta?: LogMetadata | Error): void => {
		if (meta instanceof Error) {
			logger.error(message, {
				error: meta.message,
				stack: meta.stack
			});
		} else {
			logger.error(message, meta);
		}
	},

	warn: (message: string, meta?: LogMetadata): void => {
		logger.warn(message, meta);
	},

	info: (message: string, meta?: LogMetadata): void => {
		logger.info(message, meta);
	},

	http: (message: string, meta?: LogMetadata): void => {
		logger.http(message, meta);
	},

	debug: (message: string, meta?: LogMetadata): void => {
		logger.debug(message, meta);
	}
};

/**
 * Log slow database queries
 * Warns if query duration exceeds threshold
 */
export function logSlowQuery(
	queryName: string,
	duration: number,
	threshold = 1000,
	meta?: LogMetadata
): void {
	if (duration > threshold) {
		log.warn(`Slow query detected: ${queryName}`, {
			...meta,
			duration,
			threshold,
			queryName
		});
	} else {
		log.debug(`Query completed: ${queryName}`, {
			...meta,
			duration,
			queryName
		});
	}
}

/**
 * Log database migrations
 */
export function logMigration(
	action: 'UP' | 'DOWN',
	filename: string,
	duration: number,
	success: boolean,
	meta?: LogMetadata
): void {
	const level = success ? 'info' : 'error';
	const message = `Migration ${action}: ${filename} ${success ? 'succeeded' : 'failed'}`;

	logger.log(level, message, {
		...meta,
		duration,
		action,
		filename,
		success
	});
}

export default logger;
