import { Result, Option } from 'ts-results';

export function extractSome<T>(option: Option<T>): T {
  if (option.some) {
    return option.val;
  } else {
    throw new Error('option is None');
  }
}

export function extractOk<T, U>(result: Result<T, U>): T {
  if (result.ok) {
    return result.val;
  } else {
    throw new Error('result is not ok');
  }
}
