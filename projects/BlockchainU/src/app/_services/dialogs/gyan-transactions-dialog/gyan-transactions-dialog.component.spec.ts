import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GyanTransactionsDialogComponent } from './gyan-transactions-dialog.component';

describe('GyanTransactionsDialogComponent', () => {
  let component: GyanTransactionsDialogComponent;
  let fixture: ComponentFixture<GyanTransactionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GyanTransactionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GyanTransactionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
