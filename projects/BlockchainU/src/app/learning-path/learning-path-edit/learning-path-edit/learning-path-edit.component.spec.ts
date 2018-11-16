import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningPathEditComponent } from './learning-path-edit.component';

describe('LearningPathEditComponent', () => {
  let component: LearningPathEditComponent;
  let fixture: ComponentFixture<LearningPathEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningPathEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningPathEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
