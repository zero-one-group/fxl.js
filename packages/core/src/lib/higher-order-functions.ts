import * as t from './types';

/**
 * Takes in an argument and an array of functions. Returns the output of the
 * left-to-right composed function applied on the argument.
 *
 * @remarks
 * Similar to Clojure's `->` macro, but only for 1-adic functions:
 * {@link https://clojuredocs.org/clojure.core/-%3E}
 *
 * @example
 * ```ts
 * fxl.pipe(1, (x) => x + 1, (x) => x ** 3) // returns (1 + 1) ** 3 = 8
 * ```
 *
 * @param {T} init
 * @param {t.Monoid<T>[]} fns
 * @returns {T}
 */
export function pipe<T>(init: T, ...fns: t.Monoid<T>[]): T {
  return fns.reduce((acc: T, fn: t.Monoid<T>) => fn(acc), init);
}

/**
 * Takes in an array of functions. Returns the resulting left-to-right
 * composed function.
 *
 * @example
 * ```ts
 * fxl.compose((x) => x + 1, (x) => x ** 3)(1) // returns (1 + 1) ** 3 = 8
 * ```
 *
 * @param {t.Monoid<T>[]} fns
 * @returns {T}
 */
export function compose<T>(...fns: t.Monoid<T>[]): t.Monoid<T> {
  return (arg: T) => pipe(arg, ...fns);
}

/**
 * Takes in a predicate and function. Returns a function that applies the
 * function only when the predicate evaluates to `true`.
 *
 * @param {(arg: T) => boolean} predicate
 * @param {t.Monoid<T>} fn
 * @returns {t.Monoid<T>}
 */
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

/**
 * Takes in a predicate and two functions. Returns a function that applies
 * one function when the predicate evaluates to `true`, otherwise applies the
 * other function.
 *
 * @param {(arg: T) => boolean} predicate
 * @param {t.Monoid<T>} trueFn
 * @param {t.Monoid<T>} falseFn
 * @returns {t.Monoid<T>}
 */
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
