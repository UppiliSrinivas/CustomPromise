import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import throttle from "../../src/features/throttle";

const fn = vi.fn((_signal: AbortSignal, v: string) => v);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("throttle", () => {
  it("should throttle calls with leading true and trailing false", async () => {
    const t = throttle(fn, 500, { leading: true, trailing: false });

    t("A");
    t("B");
    t("C");
    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");

    // move time forward
    vi.advanceTimersByTime(500);

    // no trailing call
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should throttle calls with leading false and trailing true", async () => {
    const t = throttle(fn, 500, { leading: false, trailing: true });

    t("A");
    t("B");
    t("C");

    // nothing yet
    expect(fn).not.toHaveBeenCalled();

    // move time forward
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "C");
  });

  it("should throttle calls with leading true and trailing true", async () => {
    const t = throttle(fn, 500, { leading: true, trailing: true });

    t("A");
    t("B");
    t("C");

    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");

    // move time forward
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(expect.any(AbortSignal), "C");
  });

  it("should cancel further calls after cancel is invoked", async () => {
    const t = throttle(fn, 500, { leading: true, trailing: true });

    t("A");
    t("B");

    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");

    // cancel further calls
    t.cancel();

    // move time forward
    vi.advanceTimersByTime(500);

    // no trailing call
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should flush calls with leading true and trailing false", async () => {
    const t = throttle(fn, 500, { leading: true, trailing: false });

    t("A");
    t("B");
    t("C");

    t.flush();

    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "A");
  });

  it("should flush calls with leading false and trailing true", async () => {
    const t = throttle(fn, 500, { leading: false, trailing: true });

    t("A");
    t("B");
    t("C");

    t.flush();

    // should be called immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal), "C");
  });
});
