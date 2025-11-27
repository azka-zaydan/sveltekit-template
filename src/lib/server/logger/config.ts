import { env } from '$env/dynamic/private';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Get log level from environment or default based on NODE_ENV
 */
export function getLogLevel(): string {
	if (env.LOG_LEVEL) {
		return env.LOG_LEVEL;
	}
	return env.NODE_ENV === 'production' ? 'info' : 'debug';
}

/**
 * Create Winston transports based on environment configuration
 * Always includes console transport, optionally adds file transports
 */
export function createTransports(): winston.transport[] {
	const transports: winston.transport[] = [];

	// Console transport - always enabled
	transports.push(
		new winston.transports.Console({
			level: getLogLevel()
		})
	);

	// File transports - only if LOG_TO_FILE is enabled
	if (env.LOG_TO_FILE === 'true') {
		const logDir = env.LOG_DIR || 'logs';
		const maxSize = env.LOG_MAX_SIZE || '10m';
		const maxFiles = env.LOG_MAX_FILES || '7d';

		// Combined logs (all levels)
		transports.push(
			new DailyRotateFile({
				level: getLogLevel(),
				dirname: logDir,
				filename: 'combined-%DATE%.log',
				datePattern: 'YYYY-MM-DD',
				maxSize,
				maxFiles,
				format: winston.format.combine(winston.format.timestamp(), winston.format.json())
			})
		);

		// Error logs (error level only, longer retention)
		transports.push(
			new DailyRotateFile({
				level: 'error',
				dirname: logDir,
				filename: 'error-%DATE%.log',
				datePattern: 'YYYY-MM-DD',
				maxSize,
				maxFiles: '14d', // Keep error logs longer
				format: winston.format.combine(winston.format.timestamp(), winston.format.json())
			})
		);

		// HTTP logs (http level only)
		transports.push(
			new DailyRotateFile({
				level: 'http',
				dirname: logDir,
				filename: 'http-%DATE%.log',
				datePattern: 'YYYY-MM-DD',
				maxSize,
				maxFiles,
				format: winston.format.combine(winston.format.timestamp(), winston.format.json())
			})
		);
	}

	return transports;
}
