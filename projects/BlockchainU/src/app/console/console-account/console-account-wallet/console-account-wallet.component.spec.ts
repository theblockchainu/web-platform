import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountWalletComponent } from './console-account-wallet.component';

describe('ConsoleAccountWalletComponent', () => {
  let component: ConsoleAccountWalletComponent;
  let fixture: ComponentFixture<ConsoleAccountWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
