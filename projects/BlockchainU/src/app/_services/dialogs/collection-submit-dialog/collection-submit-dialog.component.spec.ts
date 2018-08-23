import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSubmitDialogComponent } from './collection-submit-dialog.component';

describe('CollectionSubmitDialogComponent', () => {
  let component: CollectionSubmitDialogComponent;
  let fixture: ComponentFixture<CollectionSubmitDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionSubmitDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSubmitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
