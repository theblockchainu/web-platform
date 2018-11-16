import { LearningPathPageModule } from './learning-path-page.module';

describe('LearningPathPageModule', () => {
  let learningPathPageModule: LearningPathPageModule;

  beforeEach(() => {
    learningPathPageModule = new LearningPathPageModule();
  });

  it('should create an instance', () => {
    expect(learningPathPageModule).toBeTruthy();
  });
});
