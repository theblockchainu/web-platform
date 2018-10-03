import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningGuidesComponent } from './console-learning-guides.component';

describe('ConsoleLearningGuidesComponent', () => {
  let component: ConsoleLearningGuidesComponent;
  let fixture: ComponentFixture<ConsoleLearningGuidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningGuidesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningGuidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
