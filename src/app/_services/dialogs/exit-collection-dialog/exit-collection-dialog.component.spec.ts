import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitCollectionDialogComponent } from './exit-collection-dialog.component';

describe('ExitCollectionDialogComponent', () => {
  let component: ExitCollectionDialogComponent;
  let fixture: ComponentFixture<ExitCollectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExitCollectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitCollectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
