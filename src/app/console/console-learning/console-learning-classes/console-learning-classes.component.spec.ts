import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningClassesComponent } from './console-learning-classes.component';

describe('ConsoleLearningClassesComponent', () => {
  let component: ConsoleLearningClassesComponent;
  let fixture: ComponentFixture<ConsoleLearningClassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningClassesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
