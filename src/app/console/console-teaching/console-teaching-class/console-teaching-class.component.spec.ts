import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingClassComponent } from './console-teaching-class.component';

describe('ConsoleTeachingClassComponent', () => {
  let component: ConsoleTeachingClassComponent;
  let fixture: ComponentFixture<ConsoleTeachingClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
