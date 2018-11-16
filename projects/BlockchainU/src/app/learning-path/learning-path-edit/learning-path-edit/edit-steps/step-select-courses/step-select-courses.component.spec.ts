import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSelectCoursesComponent } from './step-select-courses.component';

describe('StepSelectCoursesComponent', () => {
  let component: StepSelectCoursesComponent;
  let fixture: ComponentFixture<StepSelectCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepSelectCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepSelectCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
