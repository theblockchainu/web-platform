import { LearningPathEditModule } from './learning-path-edit.module';

describe('LearningPathEditModule', () => {
  let learningPathEditModule: LearningPathEditModule;

  beforeEach(() => {
    learningPathEditModule = new LearningPathEditModule();
  });

  it('should create an instance', () => {
    expect(learningPathEditModule).toBeTruthy();
  });
});
