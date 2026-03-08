import { mock, expect, test, describe, beforeEach } from "bun:test";

const mockToast = {
  success: mock((message: string) => {}),
  error: mock((message: string) => {}),
  loading: mock((message: string) => "toast-id"),
  dismiss: mock((id: string) => {}),
};

// Mock the entire module before any other imports
mock.module("sonner", () => ({
  toast: mockToast,
}));

import { showSuccess, showError, showLoading, dismissToast } from "./toast";

describe("Toast Utilities", () => {
  beforeEach(() => {
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.loading.mockClear();
    mockToast.dismiss.mockClear();
  });

  test("showSuccess calls toast.success with the correct message", () => {
    const message = "Success message";
    showSuccess(message);
    expect(mockToast.success).toHaveBeenCalledWith(message);
  });

  test("showError calls toast.error with the correct message", () => {
    const message = "Error message";
    showError(message);
    expect(mockToast.error).toHaveBeenCalledWith(message);
  });

  test("showLoading calls toast.loading with the correct message and returns an id", () => {
    const message = "Loading...";
    const id = showLoading(message);
    expect(mockToast.loading).toHaveBeenCalledWith(message);
    expect(id).toBe("toast-id");
  });

  test("dismissToast calls toast.dismiss with the correct id", () => {
    const id = "toast-to-dismiss";
    dismissToast(id);
    expect(mockToast.dismiss).toHaveBeenCalledWith(id);
  });
});
