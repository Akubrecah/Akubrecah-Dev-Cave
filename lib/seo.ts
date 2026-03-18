/**
 * Serializes a structured data object to a JSON-LD string.
 * This ensures the data is safe for inclusion in a script tag.
 * 
 * @param data The schema.org object to serialize
 * @returns A JSON string representing the structured data
 */
export function serializeStructuredData(data: object): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Common SEO utility functions can be added here
 */
export const SEO_UTILS = {
  serializeStructuredData,
};

export default SEO_UTILS;
