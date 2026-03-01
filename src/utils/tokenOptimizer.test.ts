import { mock } from "bun:test";

// Mock dependencies that might be missing in the environment
mock.module("lru-cache", () => {
  return {
    LRUCache: class {
      private cache = new Map();
      max: number;
      size: number = 0;
      constructor(options: any) {
        this.max = options.max;
      }
      get(key: string) { return this.cache.get(key); }
      set(key: string, value: any) {
        this.cache.set(key, value);
        this.size = this.cache.size;
      }
      has(key: string) { return this.cache.has(key); }
      clear() {
        this.cache.clear();
        this.size = 0;
      }
    }
  };
});

mock.module("zon-format", () => {
  return {
    encode: (obj: any) => JSON.stringify(obj),
    decode: (str: string) => JSON.parse(str)
  };
});

import { expect, test, describe, spyOn, beforeEach } from "bun:test";
import { TokenOptimizer, MarkdownOptimizer, JsonOptimizer } from "./tokenOptimizer";

describe("TokenOptimizer.optimizeContent", () => {
  let optimizer: TokenOptimizer;

  beforeEach(() => {
    optimizer = new TokenOptimizer(100);
  });

  describe("Plain Text Optimization", () => {
    test("should remove extra whitespace and trim", () => {
      const input = "   multiple    spaces    between    words   ";
      const expected = "multiple spaces between words";
      expect(optimizer.optimizeContent(input, "text")).toBe(expected);
    });

    test("should apply sanitization", () => {
      const input = 'Alert("hello") & <script>';
      // " -> &quot;
      // ' -> &#x27;
      // & -> &
      // < -> <
      // > -> >
      const expected = 'Alert(&quot;hello&quot;) & <script>';
      expect(optimizer.optimizeContent(input, "text")).toBe(expected);
    });
  });

  describe("Markdown Optimization", () => {
    test("should call MarkdownOptimizer.optimize and sanitize input", () => {
      const spy = spyOn(MarkdownOptimizer, "optimize");
      const input = "  # Title  \n\n\n  Content with \"quotes\"  ";

      const result = optimizer.optimizeContent(input, "markdown");

      expect(spy).toHaveBeenCalled();
      expect(result).toContain("&quot;quotes&quot;");
      expect(result).not.toContain("\n\n\n");

      spy.mockRestore();
    });
  });

  describe("JSON Optimization", () => {
    test("should call JsonOptimizer.optimize but currently it fails to parse due to prior sanitization", () => {
      const spy = spyOn(JsonOptimizer, "optimize");
      const input = '  {"key":   "value with <tags>"}  ';

      const result = optimizer.optimizeContent(input, "json");

      expect(spy).toHaveBeenCalled();
      // Current behavior: sanitizeContent replaces " with &quot;,
      // which makes JSON.parse fail in JsonOptimizer.optimize.
      // So it returns the sanitized string as is.
      expect(result).toBe('{&quot;key&quot;:   &quot;value with <tags>&quot;}');

      spy.mockRestore();
    });

    test("should return original content (sanitized) if JSON is invalid", () => {
      const input = '{"invalid": json';
      const result = optimizer.optimizeContent(input, "json");
      expect(result).toBe('{&quot;invalid&quot;: json');
    });
  });

  describe("Caching", () => {
    test("should return cached value and not re-run optimization", () => {
      const input = "cache me if you can";

      const firstResult = optimizer.optimizeContent(input, "text");
      const statsAfterFirst = optimizer.getCacheStats();
      expect(statsAfterFirst.size).toBe(1);

      const secondResult = optimizer.optimizeContent(input, "text");
      expect(secondResult).toBe(firstResult);
      expect(optimizer.getCacheStats().size).toBe(1);
    });

    test("should use different cache keys for different types", () => {
      const input = "some content";
      optimizer.optimizeContent(input, "text");
      optimizer.optimizeContent(input, "markdown");
      optimizer.optimizeContent(input, "json");
      expect(optimizer.getCacheStats().size).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty string", () => {
      expect(optimizer.optimizeContent("", "text")).toBe("");
    });

    test("should handle already optimized content", () => {
      const optimized = "Already optimized content";
      expect(optimizer.optimizeContent(optimized, "text")).toBe(optimized);
    });

    test("should handle content that only contains whitespace", () => {
      expect(optimizer.optimizeContent("    ", "text")).toBe("");
    });
  });
});
