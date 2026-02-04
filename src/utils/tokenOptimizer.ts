import { LRUCache } from 'lru-cache';

// TOON (Token-Oriented Object Notation) implementation
export class ToonFormatter {
  static format(obj: any, schema?: Record<string, string>): string {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      
      // Check if array contains objects with same structure
      if (typeof obj[0] === 'object' && obj[0] !== null && !Array.isArray(obj[0])) {
        const keys = Object.keys(obj[0]);
        const allSameStructure = obj.every(item => 
          typeof item === 'object' && 
          item !== null && 
          !Array.isArray(item) && 
          keys.every(k => k in item) &&
          Object.keys(item).length === keys.length
        );
        
        if (allSameStructure) {
          // Use TOON format for arrays of objects
          const header = schema ? 
            `${keys.map(k => schema[k] || k).join(',')}` : 
            `${keys.join(',')}`;
          const rows = obj.map(item => 
            keys.map(k => {
              const val = item[k];
              return typeof val === 'string' && (val.includes(',') || val.includes('"')) 
                ? `"${val.replace(/"/g, '""')}"` 
                : String(val);
            }).join(',')
          );
          return `[${obj.length}]{${header}}:\n${rows.join('\n')}`;
        }
      }
      
      // Regular array formatting
      return `[${obj.map(item => this.format(item, schema)).join(', ')}]`;
    }
    
    // Object formatting
    const entries = Object.entries(obj).map(([key, value]) => {
      const formattedKey = schema ? (schema[key] || key) : key;
      return `${formattedKey}: ${this.format(value, schema)}`;
    });
    
    return entries.join('\n');
  }
}

// Markdown optimizer
export class MarkdownOptimizer {
  static optimize(markdown: string): string {
    // Remove extra whitespace and newlines
    return markdown
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple blank lines to single blank line
      .replace(/^\s+/gm, '') // Remove leading whitespace from each line
      .trim();
  }
}

// JSON optimizer
export class JsonOptimizer {
  static optimize(json: string): string {
    try {
      const obj = JSON.parse(json);
      // Minify JSON
      return JSON.stringify(obj, null, 0);
    } catch {
      // If not valid JSON, return as is
      return json;
    }
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
        case 'markdown-code-blocks':
          // Remove markdown code blocks but keep content
          filtered = filtered.replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```.*\n([\s\S]*?)```/, '$1');
          });
          break;
        case 'extra-whitespace':
          // Remove extra whitespace
          filtered = filtered.replace(/\s+/g, ' ');
          break;
        case 'repeated-lines':
          // Remove repeated consecutive lines
          filtered = filtered.replace(/^(.*?)\n(\1\n)+/gm, '$1\n');
          break;
        default:
          // Remove custom patterns
          const regex = new RegExp(filter, 'g');
          filtered = filtered.replace(regex, '');
      }
    }
    return filtered.trim();
  }
}

// Caching mechanism
export class TokenCache {
  private cache: LRUCache<string, string>;
  
  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 1000 * 60 * 60 // 1 hour TTL
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
  
  constructor(cacheSize: number = 100) {
    this.cache = new TokenCache(cacheSize);
  }
  
  // Optimize content for token efficiency
  optimizeContent(content: string, type: 'markdown' | 'json' | 'text' = 'text'): string {
    const cacheKey = `optimize:${type}:${content}`;
    
    if (this.cache.has(cacheKey)) {
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
      return this.cache.get(cacheKey)!;
    }
    
    try {
      const obj = JSON.parse(json);
      const toon = ToonFormatter.format(obj, schema);
      this.cache.set(cacheKey, toon);
      return toon;
    } catch {
      return json;
    }
  }
  
  // Filter LLM output
  filterOutput(output: string, filters: string[] = []): string {
    const cacheKey = `filter:${filters.join(',')}:${output}`;
    
    if (this.cache.has(cacheKey)) {
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
      maxSize: this.cache['cache'].max
    };
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export a default instance
export const tokenOptimizer = new TokenOptimizer();