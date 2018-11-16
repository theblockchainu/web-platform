import { CustomCertificateFormModule } from './custom-certificate-form.module';

describe('CustomCertificateFormModule', () => {
  let customCertificateFormModule: CustomCertificateFormModule;

  beforeEach(() => {
    customCertificateFormModule = new CustomCertificateFormModule();
  });

  it('should create an instance', () => {
    expect(customCertificateFormModule).toBeTruthy();
  });
});
