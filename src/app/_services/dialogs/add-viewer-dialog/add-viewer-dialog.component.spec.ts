import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddViewerDialogComponent } from './add-viewer-dialog.component';

describe('AddViewerDialogComponent', () => {
  let component: AddViewerDialogComponent;
  let fixture: ComponentFixture<AddViewerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddViewerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddViewerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
