import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningPathsComponent } from './learningPaths.component';

describe('LearningPathsComponent', () => {
  let component: LearningPathsComponent;
  let fixture: ComponentFixture<LearningPathsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningPathsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningPathsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
