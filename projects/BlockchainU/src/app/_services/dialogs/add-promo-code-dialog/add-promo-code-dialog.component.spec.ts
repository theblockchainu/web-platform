import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPromoCodeDialogComponent } from './add-promo-code-dialog.component';

describe('AddPromoCodeDialogComponent', () => {
  let component: AddPromoCodeDialogComponent;
  let fixture: ComponentFixture<AddPromoCodeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPromoCodeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPromoCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
