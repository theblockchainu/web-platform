import { NumberToWordsPipe } from './number-to-word.pipe';

describe('NumberToWordPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberToWordsPipe();
    expect(pipe).toBeTruthy();
  });
});
