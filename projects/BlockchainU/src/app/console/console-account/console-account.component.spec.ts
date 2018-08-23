import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountComponent } from './console-account.component';

describe('ConsoleAccountComponent', () => {
  let component: ConsoleAccountComponent;
  let fixture: ComponentFixture<ConsoleAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
