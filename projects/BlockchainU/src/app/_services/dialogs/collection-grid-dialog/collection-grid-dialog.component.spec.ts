import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionGridDialogComponent } from './collection-grid-dialog.component';

describe('CollectionGridDialogComponent', () => {
  let component: CollectionGridDialogComponent;
  let fixture: ComponentFixture<CollectionGridDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionGridDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionGridDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
