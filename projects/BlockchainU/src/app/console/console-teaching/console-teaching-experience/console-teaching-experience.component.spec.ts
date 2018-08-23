import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingExperienceComponent } from './console-teaching-experience.component';

describe('ConsoleTeachingExperienceComponent', () => {
  let component: ConsoleTeachingExperienceComponent;
  let fixture: ComponentFixture<ConsoleTeachingExperienceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingExperienceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
