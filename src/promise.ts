type Resolve<T> = (value: T) => void;
type Reject = (reason: unknown) => void;

type State = "pending" | "fullfilled" | "rejected" | "cancelled";

const asyncTask = (fn: () => void) => {
  queueMicrotask(fn);
};

export class CustomPromise<T> {
  private state: State = "pending";
  private value?: T;
  private reason?: unknown;

  private onFullfilled: ((v: T) => void)[] = [];
  private onRejected: ((reason: unknown) => void)[] = [];

  constructor(
    executor: (
      resolve: Resolve<T>,
      reject: Reject,
      onCancel: (cb: () => void) => void
    ) => void
  ) {
    let cancelHandler: (() => void) | null = null;

    const onCancel = (cb: () => void) => {
      cancelHandler = cb;
    };

    try {
      executor(this.reslove.bind(this), this.reject.bind(this), onCancel);
    } catch (error) {
      this.reject(error);
    }

    this.cancel = () => {
      if (this.state !== "pending") return;
      this.state = "cancelled";
      cancelHandler?.();
    };
  }

  private reslove(value: T) {
    if (this.state !== "pending") return;
    this.state = "fullfilled";
    this.value = value;
    asyncTask(() => {
      this.onFullfilled.forEach((fn) => fn(value));
      this.onFullfilled = [];
    });
  }

  private reject(reason: unknown) {
    if (this.state !== "pending") return;
    this.state = "rejected";
    this.reason = reason;
    asyncTask(() => {
      this.onRejected.forEach((fn) => fn(reason));
      this.onRejected = [];
    });
  }

  then(fn: (v: T) => void) {
    if (this.state === "fullfilled" && this.value!)
      asyncTask(() => fn(this.value!));
    else if (this.state === "pending") this.onFullfilled.push(fn);
    return this;
  }

  catch(fn: (e: unknown) => void) {
    if (this.state === "rejected") asyncTask(() => fn(this.reason!));
    else if (this.state === "pending") this.onRejected.push(fn);
    return this;
  }

  cancel!: () => void;
}
