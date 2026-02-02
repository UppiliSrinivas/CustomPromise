import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import debounce from "../../src/features/debounce";

const fn = vi.fn((_signal: AbortSignal, v: string) => v);
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("debounce", () => {
  it("Debounce - trailing, executes only once after delay", async () => {
    const d = debounce(fn, 500);

    d("A");
    d("B");
    d("C");

    // nothing yet
    expect(fn).not.toHaveBeenCalled();

    // move time forward
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "C");
  });

  it("Debounce - leading, executes immediately", async () => {
    const d = debounce(fn, 500, { leading: true, trailing: false });

    d("A");
    d("B");
    d("C");

    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");
  });
});
