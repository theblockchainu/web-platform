import { GyanBalanceModule } from './gyan-balance.module';

describe('GyanBalanceModule', () => {
  let gyanBalanceModule: GyanBalanceModule;

  beforeEach(() => {
    gyanBalanceModule = new GyanBalanceModule();
  });

  it('should create an instance', () => {
    expect(gyanBalanceModule).toBeTruthy();
  });
});
