import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingAccreditationComponent } from './console-teaching-accreditation.component';

describe('ConsoleTeachingAccreditationComponent', () => {
  let component: ConsoleTeachingAccreditationComponent;
  let fixture: ComponentFixture<ConsoleTeachingAccreditationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingAccreditationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingAccreditationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
