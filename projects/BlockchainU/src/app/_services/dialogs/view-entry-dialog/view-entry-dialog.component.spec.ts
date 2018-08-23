import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEntryDialogComponent } from './view-entry-dialog.component';

describe('ViewEntryDialogComponent', () => {
  let component: ViewEntryDialogComponent;
  let fixture: ComponentFixture<ViewEntryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEntryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEntryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
