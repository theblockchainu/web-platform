import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersSectionComponent } from './teachers-section.component';

describe('TeachersSectionComponent', () => {
  let component: TeachersSectionComponent;
  let fixture: ComponentFixture<TeachersSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeachersSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachersSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
