import { env } from '$env/dynamic/private';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Get log level from environment or default to 'info'
 */
export function getLogLevel(): string {
	return env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug');
}

/**
 * Create Winston transports based on environment configuration
 */
export function createTransports(): winston.transport[] {
	const transports: winston.transport[] = [];
	const logToFile = env.LOG_TO_FILE === 'true';
	const logDir = env.LOG_DIR || 'logs';

	// Console transport (always enabled)
	// Note: format is inherited from the logger instance
	transports.push(
		new winston.transports.Console({
			level: getLogLevel()
		})
	);

	// File transports (only if enabled)
	if (logToFile) {
		// Combined logs (all levels)
		transports.push(
			new DailyRotateFile({
				filename: `${logDir}/combined-%DATE%.log`,
				datePattern: 'YYYY-MM-DD',
				maxSize: env.LOG_MAX_SIZE || '10m',
				maxFiles: env.LOG_MAX_FILES || '7d',
				format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
				level: getLogLevel()
			})
		);

		// Error logs (errors only)
		transports.push(
			new DailyRotateFile({
				filename: `${logDir}/error-%DATE%.log`,
				datePattern: 'YYYY-MM-DD',
				maxSize: env.LOG_MAX_SIZE || '10m',
				maxFiles: env.LOG_MAX_FILES || '14d', // Keep errors longer
				format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
				level: 'error'
			})
		);

		// HTTP/API logs (separate file for easier analysis)
		transports.push(
			new DailyRotateFile({
				filename: `${logDir}/http-%DATE%.log`,
				datePattern: 'YYYY-MM-DD',
				maxSize: env.LOG_MAX_SIZE || '10m',
				maxFiles: env.LOG_MAX_FILES || '7d',
				format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
				level: 'http'
			})
		);
	}

	return transports;
}
