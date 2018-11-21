import { ProfilePopupModule } from './profile-popup.module';

describe('ProfilePopupModule', () => {
  let profilePopupModule: ProfilePopupModule;

  beforeEach(() => {
    profilePopupModule = new ProfilePopupModule();
  });

  it('should create an instance', () => {
    expect(profilePopupModule).toBeTruthy();
  });
});
