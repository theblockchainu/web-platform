import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndConditionsDialogComponent } from './terms-and-conditions-dialog.component';

describe('TermsAndConditionsDialogComponent', () => {
  let component: TermsAndConditionsDialogComponent;
  let fixture: ComponentFixture<TermsAndConditionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsAndConditionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsAndConditionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
