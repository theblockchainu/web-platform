import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupComponentDialogComponent } from './signup-dialog.component';

describe('SignupComponentDialogComponent', () => {
  let component: SignupComponentDialogComponent;
  let fixture: ComponentFixture<SignupComponentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignupComponentDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
