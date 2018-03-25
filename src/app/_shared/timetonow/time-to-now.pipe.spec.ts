import { TimeToNowPipe } from './time-to-now.pipe';

describe('TimeToNowPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeToNowPipe();
    expect(pipe).toBeTruthy();
  });
});
