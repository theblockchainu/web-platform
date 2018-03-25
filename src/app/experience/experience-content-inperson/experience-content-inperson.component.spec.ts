import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceContentInpersonComponent } from './experience-content-inperson.component';

describe('ExperienceContentInpersonComponent', () => {
  let component: ExperienceContentInpersonComponent;
  let fixture: ComponentFixture<ExperienceContentInpersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperienceContentInpersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienceContentInpersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
