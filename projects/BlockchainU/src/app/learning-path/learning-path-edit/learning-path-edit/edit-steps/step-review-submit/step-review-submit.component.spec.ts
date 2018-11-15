import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepReviewSubmitComponent } from './step-review-submit.component';

describe('StepReviewSubmitComponent', () => {
  let component: StepReviewSubmitComponent;
  let fixture: ComponentFixture<StepReviewSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepReviewSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepReviewSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
