import { CustomPromise } from "../promise";

type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

type Tail<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...infer R,
]
  ? R
  : never;

type Throttled<
  T extends (signal: AbortSignal, ...args: readonly unknown[]) => unknown,
> = {
  (...args: Tail<Parameters<T>>): CustomPromise<Awaited<ReturnType<T>>>;
  cancel(): void;
  flush(): CustomPromise<Awaited<ReturnType<T>>> | null;
};

const throttle = <
  T extends (
    signal: AbortSignal,
    ...args: readonly any[]
  ) => Awaited<ReturnType<T>>,
>(
  fn: T,
  delay: number,
  options: ThrottleOptions = {},
): Throttled<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Tail<Parameters<T>> | null = null;
  let lastExecTime = 0;
  let isCancelled = false;

  const { leading = true, trailing = true } = options;

  const invoke = (): CustomPromise<Awaited<ReturnType<T>>> | null => {
    if (!lastArgs || isCancelled) return null;

    const controller = new AbortController();
    lastExecTime = Date.now();

    return new CustomPromise((resolve, reject, onCancel) => {
      onCancel(() => {
        controller?.abort();
      });
      Promise.resolve(fn(controller.signal, ...lastArgs!))
        .then(resolve)
        .catch(reject);
    });
  };

  const throttled = (...args: Tail<Parameters<T>>) => {
    if (isCancelled)
      return new CustomPromise<Awaited<ReturnType<T>>>((_, reject) => {
        reject(new Error("Cancelled"));
      });

    lastArgs = args;
    const now = Date.now();

    const remaining = delay - (now - lastExecTime);

    // Leading execution
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      if (leading) {
        console.log("Leading call");

        return invoke()!;
      }

      lastExecTime = now;
    }

    let innerTask: CustomPromise<Awaited<ReturnType<T>>> | null = null;

    const task = new CustomPromise<Awaited<ReturnType<T>>>(
      (resolve, reject, onCancel) => {
        if (!trailing) {
          // reject(new Error("Trailing execution disabled"));
          return;
        }

        onCancel(() => {
          if (timer) clearTimeout(timer);
          innerTask?.cancel();
        });

        if (!timer) {
          timer = setTimeout(
            () => {
              timer = null;
              innerTask = invoke();
              innerTask?.then(resolve).catch(reject);
            },
            remaining > 0 ? remaining : delay,
          );
        }
      },
    );

    return task;
  };

  throttled.cancel = () => {
    isCancelled = true;
    if (timer) clearTimeout(timer);
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
