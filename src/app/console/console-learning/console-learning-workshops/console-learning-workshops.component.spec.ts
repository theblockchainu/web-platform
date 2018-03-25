import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningWorkshopsComponent } from './console-learning-workshops.component';

describe('ConsoleLearningWorkshopsComponent', () => {
  let component: ConsoleLearningWorkshopsComponent;
  let fixture: ComponentFixture<ConsoleLearningWorkshopsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningWorkshopsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningWorkshopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
