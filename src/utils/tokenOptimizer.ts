import { LRUCache } from "lru-cache";
import { decode as zonDecode, encode as zonEncode } from "zon-format";

// TOON (Token-Oriented Object Notation) implementation
export class ToonFormatter {
  // biome-ignore lint/suspicious/noExplicitAny: generic object handling
  static format(obj: any, schema?: Record<string, string>): string {
    if (typeof obj !== "object" || obj === null) {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";

      // Check if array contains objects with same structure
      if (typeof obj[0] === "object" && obj[0] !== null && !Array.isArray(obj[0])) {
        const keys = Object.keys(obj[0]);
        const allSameStructure = obj.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            keys.every((k) => k in item) &&
            Object.keys(item).length === keys.length,
        );

        if (allSameStructure) {
          // Use TOON format for arrays of objects
          const header = schema
            ? `${keys.map((k) => schema[k] || k).join(",")}`
            : `${keys.join(",")}`;
          const rows = obj.map((item) =>
            keys
              .map((k) => {
                const val = item[k];
                // Sanitize values to prevent injection
                const sanitizedVal =
                  typeof val === "string" ? val.replace(/[\n\r,]/g, " ") : String(val);
                return typeof sanitizedVal === "string" &&
                  (sanitizedVal.includes(",") || sanitizedVal.includes('"'))
                  ? `"${sanitizedVal.replace(/"/g, '""')}"`
                  : sanitizedVal;
              })
              .join(","),
          );
          return `[${obj.length}]{${header}}:\n${rows.join("\n")}`;
        }
      }

      // Regular array formatting with sanitization
      return `[${obj.map((item) => ToonFormatter.format(item, schema)).join(", ")}]`;
    }

    // Object formatting with sanitization
    const entries = Object.entries(obj).map(([key, value]) => {
      // Sanitize key
      const sanitizedKey = key.replace(/[\n\r:]/g, " ");
      const formattedKey = schema ? schema[sanitizedKey] || sanitizedKey : sanitizedKey;
      return `${formattedKey}: ${ToonFormatter.format(value, schema)}`;
    });

    return entries.join("\n");
  }
}

// ZON (Zero Overhead Notation) formatter
export class ZonFormatter {
  // biome-ignore lint/suspicious/noExplicitAny: generic object handling
  static encode(obj: any): string {
    try {
      // Sanitize object before encoding
      const sanitizedObj = ZonFormatter.sanitizeObject(obj);
      return zonEncode(sanitizedObj);
    } catch (error) {
      throw new Error(
        `ZON encoding failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: returns decoded object
  static decode(zonStr: string): any {
    try {
      return zonDecode(zonStr);
    } catch (error) {
      throw new Error(
        `ZON decoding failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Helper to sanitize objects before encoding
  // biome-ignore lint/suspicious/noExplicitAny: recursive sanitization
  private static sanitizeObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => ZonFormatter.sanitizeObject(item));
    }

    // biome-ignore lint/suspicious/noExplicitAny: dynamic object creation
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = key.replace(/[\n\r]/g, " ");
      sanitized[sanitizedKey] = ZonFormatter.sanitizeObject(value);
    }
    return sanitized;
  }
}

// Markdown optimizer
export class MarkdownOptimizer {
  static optimize(markdown: string): string {
    // Remove extra whitespace and newlines
    return markdown
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Reduce multiple blank lines to single blank line
      .replace(/^\s+/gm, "") // Remove leading whitespace from each line
      .trim();
  }
}

// JSON optimizer
export class JsonOptimizer {
  static optimize(json: string): string {
    try {
      const obj = JSON.parse(json);
      // Sanitize before minifying
      const sanitizedObj = JsonOptimizer.sanitizeObject(obj);
      // Minify JSON
      return JSON.stringify(sanitizedObj, null, 0);
    } catch {
      // If not valid JSON, return as is
      return json;
    }
  }

  // Helper to sanitize objects
  // biome-ignore lint/suspicious/noExplicitAny: recursive sanitization
  private static sanitizeObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => JsonOptimizer.sanitizeObject(item));
    }

    // biome-ignore lint/suspicious/noExplicitAny: dynamic object creation
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = key.replace(/[\n\r]/g, " ");
      sanitized[sanitizedKey] = JsonOptimizer.sanitizeObject(value);
    }
    return sanitized;
  }
}

// Output filter for LLM responses
export class OutputFilter {
  static filter(text: string, filters: string[]): string {
    // Remove specified patterns from output
    let filtered = text;
    for (const filter of filters) {
      // Handle special filter patterns
      switch (filter) {
        case "markdown-code-blocks":
          // Remove markdown code blocks but keep content
          filtered = filtered.replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```.*\n([\s\S]*?)```/, "$1");
          });
          break;
        case "extra-whitespace":
          // Remove extra whitespace
          filtered = filtered.replace(/\s+/g, " ");
          break;
        case "repeated-lines":
          // Remove repeated consecutive lines
          filtered = filtered.replace(/^(.*?)\n(\1\n)+/gm, "$1\n");
          break;
        default: {
          // Remove custom patterns
          const regex = new RegExp(filter, "g");
          filtered = filtered.replace(regex, "");
        }
      }
    }
    return filtered.trim();
  }
}

// Caching mechanism
export class TokenCache {
  private cache: LRUCache<string, string>;

  get internalCache(): LRUCache<string, string> {
    return this.cache;
  }

  constructor(maxSize = 100) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 1000 * 60 * 60, // 1 hour TTL
    });
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Main token optimization utility
export class TokenOptimizer {
  private cache: TokenCache;

  constructor(cacheSize = 100) {
    this.cache = new TokenCache(cacheSize);
  }

  // Optimize content for token efficiency
  optimizeContent(content: string, type: "markdown" | "json" | "text" = "text"): string {
    const cacheKey = `optimize:${type}:${content}`;

    if (this.cache.has(cacheKey)) {
      // biome-ignore lint/style/noNonNullAssertion: checked with has()
      return this.cache.get(cacheKey)!;
    }
    
    let optimized = content;
    
    switch (type) {
      case 'markdown':
        optimized = MarkdownOptimizer.optimize(content);
        break;
      case 'json':
        optimized = JsonOptimizer.optimize(content);
        break;
      default:
        // For plain text, just remove extra whitespace
        optimized = content.replace(/\s+/g, ' ').trim();
    }

    this.cache.set(cacheKey, optimized);
    return optimized;
  }

  // Convert JSON to TOON format
  jsonToToon(json: string, schema?: Record<string, string>): string {
    const cacheKey = `toon:${JSON.stringify(schema)}:${json}`;

    if (this.cache.has(cacheKey)) {
      // biome-ignore lint/style/noNonNullAssertion: checked with has()
      return this.cache.get(cacheKey)!;
    }

    try {
      const obj = JSON.parse(json);
      // Sanitize object before formatting
      const sanitizedObj = this.sanitizeObject(obj);
      const toon = ToonFormatter.format(sanitizedObj, schema);
      this.cache.set(cacheKey, toon);
      return toon;
    } catch {
      // Return sanitized original if parsing fails
      return this.sanitizeContent(json);
    }
  }

  // Convert JSON to ZON format
  jsonToZon(json: string): string {
    const cacheKey = `zon:${json}`;

    if (this.cache.has(cacheKey)) {
      // biome-ignore lint/style/noNonNullAssertion: checked with has()
      return this.cache.get(cacheKey)!;
    }

    try {
      const obj = JSON.parse(json);
      const zon = ZonFormatter.encode(obj);
      this.cache.set(cacheKey, zon);
      return zon;
    } catch (error) {
      throw new Error(
        `ZON conversion failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Convert ZON back to JSON
  zonToJson(zonStr: string): string {
    const cacheKey = `zonToJson:${zonStr}`;

    if (this.cache.has(cacheKey)) {
      // biome-ignore lint/style/noNonNullAssertion: checked with has()
      return this.cache.get(cacheKey)!;
    }

    try {
      const obj = ZonFormatter.decode(zonStr);
      // Sanitize object
      const sanitizedObj = this.sanitizeObject(obj);
      const json = JSON.stringify(sanitizedObj, null, 2);
      this.cache.set(cacheKey, json);
      return json;
    } catch (error) {
      throw new Error(
        `ZON to JSON conversion failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Filter LLM output
  filterOutput(output: string, filters: string[] = []): string {
    const cacheKey = `filter:${filters.join(",")}:${output}`;

    if (this.cache.has(cacheKey)) {
      // biome-ignore lint/style/noNonNullAssertion: checked with has()
      return this.cache.get(cacheKey)!;
    }
    
    const filtered = OutputFilter.filter(output, filters);
    this.cache.set(cacheKey, filtered);
    return filtered;
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size(),
      maxSize: this.cache.internalCache.max,
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Content sanitization helper
  private sanitizeContent(content: string): string {
    if (typeof content !== "string") return String(content);

    // Basic sanitization to prevent injection
    return content
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .trim();
  }

  // Object sanitization helper
  // biome-ignore lint/suspicious/noExplicitAny: recursive sanitization
  private sanitizeObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    // biome-ignore lint/suspicious/noExplicitAny: dynamic object creation
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = key
        .replace(/</g, "")
        .replace(/>/g, "")
        .replace(/&/g, "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/[\n\r]/g, " ");

      sanitized[sanitizedKey] = this.sanitizeObject(value);
    }
    return sanitized;
  }
}

// Export a default instance
export const tokenOptimizer = new TokenOptimizer();
