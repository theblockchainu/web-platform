import { NumberToWordPipe } from './number-to-word.pipe';

describe('NumberToWordPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberToWordPipe();
    expect(pipe).toBeTruthy();
  });
});
