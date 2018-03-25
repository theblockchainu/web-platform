import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningAllComponent } from './console-learning-all.component';

describe('ConsoleLearningAllComponent', () => {
  let component: ConsoleLearningAllComponent;
  let fixture: ComponentFixture<ConsoleLearningAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
