import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassContentQuizComponent } from './class-content-quiz.component';

describe('ClassContentQuizComponent', () => {
  let component: ClassContentQuizComponent;
  let fixture: ComponentFixture<ClassContentQuizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassContentQuizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassContentQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
