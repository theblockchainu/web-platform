import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepLearningPathPageComponent } from './step-learning-path-page.component';

describe('StepLearningPathPageComponent', () => {
  let component: StepLearningPathPageComponent;
  let fixture: ComponentFixture<StepLearningPathPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepLearningPathPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepLearningPathPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
