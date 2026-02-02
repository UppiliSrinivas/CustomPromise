type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

type Tail<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer R] ? R : never;

type Throttled<T extends (signal: AbortSignal, ...args: readonly unknown[]) => unknown> = {
  (...args: Tail<Parameters<T>>): Promise<Awaited<ReturnType<T>>>;
  cancel(): void;
  flush(): Promise<Awaited<ReturnType<T>>> | null;
};

const throttle = <
  T extends (signal: AbortSignal, ...args: readonly any[]) => Awaited<ReturnType<T>>
>(
  fn: T,
  delay: number,
  options: ThrottleOptions = {}
): Throttled<T> => {
  let controller: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Tail<Parameters<T>> | null = null;
  let lastExecTime = 0;

  const { leading = true, trailing = true } = options;

  const invoke = (): Promise<Awaited<ReturnType<T>>> | null => {
    if (!lastArgs) return null;

    controller?.abort();
    controller = new AbortController();
    lastExecTime = Date.now();

    return Promise.resolve(fn(controller.signal, ...lastArgs));
  };

  const throttled = (...args: Tail<Parameters<T>>) => {
    lastArgs = args;
    const now = Date.now();

    const remaining = delay - (now - lastExecTime);
    console.log("remaining => ",remaining,remaining <= 0);
    

    // Leading execution
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      if (leading) {
        return invoke()!;
      }

      lastExecTime = now;
    }

    // Trailing execution
    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      if (!trailing) {
        // reject(new Error("Trailing execution disabled"));
        return;
      }

      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke()?.then(resolve).catch(reject);
        }, remaining > 0 ? remaining : delay);
      }
    });
  };

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    controller?.abort();
    timer = null;
    lastArgs = null;
    lastExecTime = 0;
  };

  throttled.flush = () => {
    if (!timer || !lastArgs || !trailing) return null;
    clearTimeout(timer);
    timer = null;
    return invoke();
  };

  return throttled;
};

export default throttle;
