import { expect, test, describe } from "bun:test";
import { SecureStorage } from "./secureStorage";

// Mocking browser globals
if (typeof window === 'undefined') {
  global.window = {} as any;
}

if (typeof sessionStorage === 'undefined') {
  const store: Record<string, string> = {};
  global.sessionStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  } as Storage;
}

if (typeof localStorage === 'undefined') {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { for (const key in store) delete store[key]; },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    } as Storage;
}

if (typeof crypto === 'undefined') {
    const { webcrypto } = await import('node:crypto');
    global.crypto = webcrypto as any;
}

describe("SecureStorage", () => {
  test("should encrypt and decrypt correctly", async () => {
    const data = "Hello, world!";
    const encrypted = await SecureStorage.encrypt(data);
    const decrypted = await SecureStorage.decrypt(encrypted);
    expect(decrypted).toBe(data);
  });

  test("should store and retrieve items from localStorage", async () => {
    const key = "test-key";
    const value = "test-value";
    await SecureStorage.setItem(key, value);
    const retrieved = await SecureStorage.getItem(key);
    expect(retrieved).toBe(value);
  });

  test("should handle non-existent items", async () => {
    const retrieved = await SecureStorage.getItem("non-existent");
    expect(retrieved).toBeNull();
  });

  test("should remove items", async () => {
    const key = "remove-me";
    await SecureStorage.setItem(key, "value");
    SecureStorage.removeItem(key);
    const retrieved = await SecureStorage.getItem(key);
    expect(retrieved).toBeNull();
  });

  test("should clear all items", async () => {
    await SecureStorage.setItem("key1", "val1");
    await SecureStorage.setItem("key2", "val2");
    SecureStorage.clear();
    expect(await SecureStorage.getItem("key1")).toBeNull();
    expect(await SecureStorage.getItem("key2")).toBeNull();
  });
});
