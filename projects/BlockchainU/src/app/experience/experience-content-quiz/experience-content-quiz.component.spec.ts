import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceContentQuizComponent } from './experience-content-quiz.component';

describe('ExperienceContentQuizComponent', () => {
  let component: ExperienceContentQuizComponent;
  let fixture: ComponentFixture<ExperienceContentQuizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperienceContentQuizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienceContentQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
