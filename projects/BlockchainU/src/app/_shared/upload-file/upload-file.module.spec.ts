import { UploadFileModule } from './upload-file.module';

describe('UploadFileModule', () => {
  let uploadFileModule: UploadFileModule;

  beforeEach(() => {
    uploadFileModule = new UploadFileModule();
  });

  it('should create an instance', () => {
    expect(uploadFileModule).toBeTruthy();
  });
});
