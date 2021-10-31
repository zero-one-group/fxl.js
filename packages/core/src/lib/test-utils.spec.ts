import { Ok, Err, Some, None } from 'ts-results';

import * as utils from './test-utils';

describe('force extraction functions', () => {
  it('happy path', () => {
    const okValue = utils.extractOk(Ok(1));
    expect(okValue).toBe(1);
    const someValue = utils.extractSome(Some('abc'));
    expect(someValue).toBe('abc');
  });

  it('unhappy path', () => {
    expect(() => utils.extractOk(Err(1))).toThrow(Error);
    expect(() => utils.extractSome(None)).toThrow(Error);
  });
});
