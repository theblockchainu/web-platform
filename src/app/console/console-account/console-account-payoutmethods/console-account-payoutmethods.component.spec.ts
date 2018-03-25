import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountPayoutmethodsComponent } from './console-account-payoutmethods.component';

describe('ConsoleAccountPayoutmethodsComponent', () => {
  let component: ConsoleAccountPayoutmethodsComponent;
  let fixture: ComponentFixture<ConsoleAccountPayoutmethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountPayoutmethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountPayoutmethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
