import { CustomPromise } from "./promise";

type DebounceOptions = {
  leading?: boolean;
  trailing?: boolean;
};

type Tail<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...infer R
]
  ? R
  : never;

type Debounced<
  T extends (signal: AbortSignal, ...args: readonly unknown[]) => unknown
> = {
  (...args: Tail<Parameters<T>>): CustomPromise<Awaited<ReturnType<T>>>;
  cancel(): void;
  flush(): CustomPromise<Awaited<ReturnType<T>>> | null;
};

const debounce = <
  T extends (
    signal: AbortSignal,
    ...args: readonly any[]
  ) => Awaited<ReturnType<T>>
>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): Debounced<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Tail<Parameters<T>> | null = null;
  let lastTask: CustomPromise<Awaited<ReturnType<T>>> | null = null;

  const { leading = false, trailing = true } = options;

  const invoke = (): CustomPromise<Awaited<ReturnType<T>>> | null => {
    if (!lastArgs) return null;

    const controller = new AbortController();

    return new CustomPromise((resolve, reject, onCancel) => {
      onCancel(() => controller?.abort());
      Promise.resolve(fn(controller!.signal, ...lastArgs!))
        .then(resolve)
        .catch(reject);
    });
  };

  const debounced = (...args: Tail<Parameters<T>>) => {
    lastArgs = args;

    // lastTask?.cancel()

    const shouldCallLeading = leading && !timer;

    if (timer) clearTimeout(timer);

    if (shouldCallLeading) {
      lastTask = invoke()!;
      return lastTask;
    } else lastTask?.cancel();

    let innerTask: CustomPromise<any> | null = null;

    const task = new CustomPromise<Awaited<ReturnType<T>>>(
      (resolve, reject, onCancel) => {
        if (!trailing) {
          // reject(new Error("Trailing execution disabled"));
          return;
        }

        timer = setTimeout(() => {
          timer = null;
          innerTask = invoke();
          innerTask?.then(resolve).catch(reject);
        }, delay);

        onCancel(() => {
          console.log("Outer cancel", innerTask);
          innerTask?.cancel();
          clearTimeout(timer!);
        });
      }
    );
    lastTask = task;
    return task;
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastTask?.cancel();
    lastArgs = null;
  };

  debounced.flush = () => {
    if (!lastArgs || !trailing) return null;

    if (timer) clearTimeout(timer);
    timer = null;

    lastTask?.cancel();
    lastTask = invoke();
    return lastTask;
  };

  return debounced;
};

export default debounce;
