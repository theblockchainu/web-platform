import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepLearningPathComponent } from './step-learning-path.component';

describe('StepLearningPathComponent', () => {
  let component: StepLearningPathComponent;
  let fixture: ComponentFixture<StepLearningPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepLearningPathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepLearningPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
