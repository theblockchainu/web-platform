import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningExperiencesComponent } from './console-learning-experiences.component';

describe('ConsoleLearningExperiencesComponent', () => {
  let component: ConsoleLearningExperiencesComponent;
  let fixture: ComponentFixture<ConsoleLearningExperiencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningExperiencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
