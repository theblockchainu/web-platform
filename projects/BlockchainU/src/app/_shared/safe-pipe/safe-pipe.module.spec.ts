import { SafePipeModule } from './safe-pipe.module';

describe('SafePipeModule', () => {
  let safePipeModule: SafePipeModule;

  beforeEach(() => {
    safePipeModule = new SafePipeModule();
  });

  it('should create an instance', () => {
    expect(safePipeModule).toBeTruthy();
  });
});
