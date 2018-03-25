import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountTransactionhistoryComponent } from './console-account-transactionhistory.component';

describe('ConsoleAccountTransactionhistoryComponent', () => {
  let component: ConsoleAccountTransactionhistoryComponent;
  let fixture: ComponentFixture<ConsoleAccountTransactionhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountTransactionhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountTransactionhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
