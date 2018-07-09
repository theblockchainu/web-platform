import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionStandardsDialogComponent } from './collection-standards-dialog.component';

describe('CollectionStandardsDialogComponent', () => {
  let component: CollectionStandardsDialogComponent;
  let fixture: ComponentFixture<CollectionStandardsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionStandardsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionStandardsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
