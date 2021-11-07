import { Result, Option } from 'ts-results';

/**
 * Force returns the `Some` value of ts-results' `Option`. Throws an error if
 * it receives a `None` object.
 *
 * @param {Option<T>} option
 * @returns {T}
 */
export function extractSome<T>(option: Option<T>): T {
  if (option.some) {
    return option.val;
  } else {
    throw new Error('option is None');
  }
}

/**
 * Force returns the `Ok` value of ts-results' `Result`. Throws an error if it
 * receives an `Err` object.
 *
 * @param {Result<T, U>} option
 * @returns {T}
 */
export function extractOk<T, U>(result: Result<T, U>): T {
  if (result.ok) {
    return result.val;
  } else {
    throw new Error('result is not ok');
  }
}
