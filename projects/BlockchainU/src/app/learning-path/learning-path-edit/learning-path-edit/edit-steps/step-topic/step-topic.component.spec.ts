import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepTopicComponent } from './step-topic.component';

describe('StepTopicComponent', () => {
  let component: StepTopicComponent;
  let fixture: ComponentFixture<StepTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
