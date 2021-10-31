import * as t from './types';

export function pipe<T>(init: T, ...fns: t.Monoid<T>[]): T {
  return fns.reduce((acc: T, fn: t.Monoid<T>) => fn(acc), init);
}

export function compose<T>(...fns: t.Monoid<T>[]): t.Monoid<T> {
  return (arg: T) => pipe(arg, ...fns);
}
