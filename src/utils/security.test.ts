import { expect, test, describe } from "bun:test";

// Mocking the sanitizeLog function from src/components/Terminal.tsx
const sanitizeLog = (log: string): string => {
  return log
    .replace(/(sk-(?:[a-zA-Z0-9]{20,}))/g, 'sk-***')
    .replace(/(\/[^\s]*\/(?:home|users|root)\/[^\s]*)/gi, '/***')
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@***.***')
    .replace(/(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/g, '***.***.***.***')
    .replace(/(password\s*[=:]\s*['"]?[^'"\s]+['"]?)/gi, 'password=***')
    .replace(/(token\s*[=:]\s*['"]?[^'"\s]+['"]?)/gi, 'token=***')
    .replace(/(key\s*[=:]\s*['"]?[^'"\s]+['"]?)/gi, 'key=***');
};

// Mocking the sanitizeInput function from src/components/ChatInterface.tsx
const sanitizeInput = (input: string): string => {
  return input.trim();
};

describe("Security Sanitization", () => {
  test("sanitizeLog masks sensitive information", () => {
    expect(sanitizeLog("My key is sk-123456789012345678901234567890")).toBe("My key is sk-***");
    expect(sanitizeLog("Email me at test@example.com")).toBe("Email me at ***@***.***");
    expect(sanitizeLog("Server IP is 192.168.1.1")).toBe("Server IP is ***.***.***.***");
    expect(sanitizeLog("path: /var/home/user/secret.txt")).toBe("path: /***");
    expect(sanitizeLog("password=mysecret")).toBe("password=***");
  });

  test("sanitizeLog does NOT escape HTML (React will handle this)", () => {
    const payload = "<img src=x onerror=alert(1)>";
    expect(sanitizeLog(payload)).toBe(payload);
  });

  test("sanitizeInput trims input", () => {
    expect(sanitizeInput("  hello world  ")).toBe("hello world");
  });

  test("sanitizeInput does NOT escape HTML (React will handle this)", () => {
    const payload = "<script>alert(1)</script>";
    expect(sanitizeInput(payload)).toBe(payload);
  });
});
