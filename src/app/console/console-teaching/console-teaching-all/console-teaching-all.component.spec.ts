import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingAllComponent } from './console-teaching-all.component';

describe('ConsoleTeachingAllComponent', () => {
  let component: ConsoleTeachingAllComponent;
  let fixture: ComponentFixture<ConsoleTeachingAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
