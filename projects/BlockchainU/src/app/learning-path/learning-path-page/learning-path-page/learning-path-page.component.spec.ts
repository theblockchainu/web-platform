import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningPathPageComponent } from './learning-path-page.component';

describe('LearningPathPageComponent', () => {
  let component: LearningPathPageComponent;
  let fixture: ComponentFixture<LearningPathPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningPathPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningPathPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
