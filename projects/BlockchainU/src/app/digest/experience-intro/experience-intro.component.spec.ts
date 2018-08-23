import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceIntroComponent } from './experience-intro.component';

describe('ExperienceIntroComponent', () => {
  let component: ExperienceIntroComponent;
  let fixture: ComponentFixture<ExperienceIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperienceIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienceIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
