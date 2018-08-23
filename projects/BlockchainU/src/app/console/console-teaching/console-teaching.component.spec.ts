import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingComponent } from './console-teaching.component';

describe('ConsoleTeachingComponent', () => {
  let component: ConsoleTeachingComponent;
  let fixture: ComponentFixture<ConsoleTeachingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
