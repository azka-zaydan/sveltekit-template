/**
 * Format a price value to USD currency string
 */
export function formatPrice(price: number | string | null | undefined): string {
	if (price === null || price === undefined || price === '') {
		return 'Free';
	}
	const numPrice = typeof price === 'string' ? parseFloat(price) : price;
	if (isNaN(numPrice) || numPrice === 0) {
		return 'Free';
	}
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(numPrice);
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format a relative date (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - dateObj.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
	return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
}
