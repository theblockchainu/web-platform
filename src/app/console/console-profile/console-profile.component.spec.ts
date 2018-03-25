import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleProfileComponent } from './console-profile.component';

describe('ConsoleProfileComponent', () => {
  let component: ConsoleProfileComponent;
  let fixture: ComponentFixture<ConsoleProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
