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
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");
  });

  it("Debounce - leading and trailing, executes both", async () => {
    const d = debounce(fn, 500, { leading: true, trailing: true });

    d("A");
    d("B");
    d("C");

    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");

    // move time forward
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(expect.any(AbortSignal), "C");
  });

  it("Debounce - cancel, should not execute", async () => {
    const d = debounce(fn, 500);

    d("A");
    d("B");

    d.cancel();

    // move time forward
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();
  });

  it("Debounce - flush, should execute immediately", async () => {
    const d = debounce(fn, 500);

    d("A");
    d("B");

    // nothing yet
    expect(fn).not.toHaveBeenCalled();

    d.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "B");
  });
});
