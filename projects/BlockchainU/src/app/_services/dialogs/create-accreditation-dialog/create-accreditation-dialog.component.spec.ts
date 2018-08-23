import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccreditationDialogComponent } from './create-accreditation-dialog.component';

describe('CreateAccreditationDialogComponent', () => {
  let component: CreateAccreditationDialogComponent;
  let fixture: ComponentFixture<CreateAccreditationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccreditationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccreditationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
