import { QuestionPageModule } from './question-page.module';

describe('QuestionPageModule', () => {
  let questionPageModule: QuestionPageModule;

  beforeEach(() => {
    questionPageModule = new QuestionPageModule();
  });

  it('should create an instance', () => {
    expect(questionPageModule).toBeTruthy();
  });
});
