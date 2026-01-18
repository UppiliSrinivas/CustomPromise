import debounce from "./debounce";
import throttle from "./thottle";

const log = (_signal: AbortSignal, msg: string) => {
  console.log(`${msg}`);
};

/* // Debounce: leading: false, trailing: true (DEFAULT)
const d1 = debounce(log, 1000, {
  leading: false,
  trailing: true,
});

d1("A");
d1("B");
d1("C");

// Debounce: leading: true, trailing: false
const d2 = debounce(log, 1000, {
  leading: true,
  trailing: false,
});

d2("A");
d2("B");
d2("C");

// Debounce: leading: true, trailing: true
const d3 = debounce(log, 1000, {
  leading: true,
  trailing: true,
});

d3("A");
d3("B");
d3("C"); */

// Debounce: cancel()
const d4 = debounce(log, 1000);

d4("A");
d4("B");

d4.cancel();
/* 
// Debounce: flush()
const d5 = debounce(log, 1000);

d5("A");

setTimeout(() => {
  d5.flush();
}, 300);

// Throttle: leading: true, trailing: false
const t1 = throttle(log, 1000, {
  leading: true,
  trailing: false,
});

t1("A");
t1("B");
t1("C");

// Throttle: leading: false, trailing: true
const t2 = throttle(log, 1000, {
  leading: false,
  trailing: true,
});

t2("A");
t2("B");
t2("C");

// Throttle: leading: true, trailing: true
const t3 = throttle(log, 1000, {
  leading: true,
  trailing: true,
});

t3("A");
t3("B");
t3("C");

// Throttle: cancel()
const t4 = throttle(log, 1000);

t4("A");
t4("B");

t4.cancel();

// Throttle: flush()
const t5 = throttle(log, 1000);

t5("A");
t5("B");

setTimeout(() => {
  t5.flush();
}, 300);

 */