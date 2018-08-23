import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningSessionsComponent } from './console-learning-sessions.component';

describe('ConsoleLearningSessionsComponent', () => {
  let component: ConsoleLearningSessionsComponent;
  let fixture: ComponentFixture<ConsoleLearningSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
