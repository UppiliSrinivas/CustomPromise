import debounce from "./features/debounce";
import throttle from "./features/throttle";

const log = (_signal: AbortSignal, msg: string) => {
  console.log(`${msg}`);
};

// Debounce: leading: false, trailing: true (DEFAULT)
const d1 = debounce(log, 1000, {
  leading: false,
  trailing: true,
});

d1("A");
d1("B");
d1("Debounce: leading: false, trailing: true => C");

// Debounce: leading: true, trailing: false
const d2 = debounce(log, 1000, {
  leading: true,
  trailing: false,
});

d2("Debounce: leading: true, trailing : A");
d2("B");
d2("C");

// Debounce: leading: true, trailing: true
const d3 = debounce(log, 1000, {
  leading: true,
  trailing: true,
});

d3("Debounce: leading: true, trailing: true => A");
d3("B");
d3("Debounce: leading: true, trailing: true => C");

// Debounce: cancel()
const d4 = debounce(log, 1000);

d4("A");
d4("B");

d4.cancel();

// Debounce: flush()
const d5 = debounce(log, 1000);

d5("Debounce: flush() => A");

setTimeout(() => {
  d5.flush();
}, 300);

// Throttle: leading: true, trailing: false
const t1 = throttle(log, 1000, {
  leading: true,
  trailing: false,
});

t1("Throttle: leading: true, trailing: false => A");
t1("Throttle: leading: true, trailing: false => B");
t1("Throttle: leading: true, trailing: false => C");

// Throttle: leading: false, trailing: true
const t2 = throttle(log, 1000, {
  leading: false,
  trailing: true,
});

t2("Throttle: leading: false, trailing: true => A");
t2("Throttle: leading: false, trailing: true => B");
t2("Throttle: leading: false, trailing: true => C");

// Throttle: leading: true, trailing: true
const t3 = throttle(log, 1000, {
  leading: true,
  trailing: true,
});

t3("Throttle: leading: true, trailing: true => A");
t3("Throttle: leading: true, trailing: true => B");
t3("Throttle: leading: true, trailing: true => C");

// Throttle: cancel()
const t4 = throttle(log, 1000);

t4("Throttle: cancel() => A");
t4("Throttle: cancel() => B");

t4.cancel();

// Throttle: flush()
const t5 = throttle(log, 1000, { leading: false, trailing: false });

t5("Throttle: flush() => A");
t5("Throttle: flush() => B");

setTimeout(() => {
  t5.flush();
}, 300);
