import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelCollectionDialogComponent } from './cancel-collection-dialog.component';

describe('CancelCollectionDialogComponent', () => {
  let component: CancelCollectionDialogComponent;
  let fixture: ComponentFixture<CancelCollectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelCollectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelCollectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
