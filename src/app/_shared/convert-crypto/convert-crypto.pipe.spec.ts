import { ConvertCryptoPipe } from './convert-crypto.pipe';

describe('ConvertCryptoPipe', () => {
  it('create an instance', () => {
    const pipe = new ConvertCryptoPipe();
    expect(pipe).toBeTruthy();
  });
});
