/**
 * Generate image preview URLs from FileList
 */
export async function generateImagePreviews(files: FileList | null): Promise<string[]> {
	if (!files || files.length === 0) return [];

	const previews: string[] = [];

	for (const file of Array.from(files)) {
		const preview = await readFileAsDataURL(file);
		if (preview) {
			previews.push(preview);
		}
	}

	return previews;
}

/**
 * Read a file as a data URL
 */
function readFileAsDataURL(file: File): Promise<string | null> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			resolve(e.target?.result as string | null);
		};
		reader.onerror = () => resolve(null);
		reader.readAsDataURL(file);
	});
}

/**
 * Validate image file size and type
 */
export function validateImageFile(file: File, maxSizeMB = 5): { valid: boolean; error?: string } {
	const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

	if (!validTypes.includes(file.type)) {
		return {
			valid: false,
			error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.'
		};
	}

	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		return {
			valid: false,
			error: `File size exceeds ${maxSizeMB}MB limit.`
		};
	}

	return { valid: true };
}
