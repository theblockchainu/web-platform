import { LearningPathModule } from './learning-path.module';

describe('LearningPathModule', () => {
  let learningPathModule: LearningPathModule;

  beforeEach(() => {
    learningPathModule = new LearningPathModule();
  });

  it('should create an instance', () => {
    expect(learningPathModule).toBeTruthy();
  });
});
