import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningComponent } from './console-learning.component';

describe('ConsoleLearningComponent', () => {
  let component: ConsoleLearningComponent;
  let fixture: ComponentFixture<ConsoleLearningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
