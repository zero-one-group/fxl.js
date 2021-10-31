import * as t from './types';

export function pipe<T>(init: T, ...fns: t.Monoid<T>[]): T {
  return fns.reduce((acc: T, fn: t.Monoid<T>) => fn(acc), init);
}

export function compose<T>(...fns: t.Monoid<T>[]): t.Monoid<T> {
  return (arg: T) => pipe(arg, ...fns);
}

export function applyIf<T>(
  predicate: (arg: T) => boolean,
  fn: t.Monoid<T>
): t.Monoid<T> {
  return (arg: T) => {
    if (predicate(arg)) {
      return fn(arg);
    } else {
      return arg;
    }
  };
}

export function applyIfElse<T>(
  predicate: (arg: T) => boolean,
  trueFn: t.Monoid<T>,
  falseFn: t.Monoid<T>
): t.Monoid<T> {
  return (arg: T) => {
    if (predicate(arg)) {
      return trueFn(arg);
    } else {
      return falseFn(arg);
    }
  };
}
