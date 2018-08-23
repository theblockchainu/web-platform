import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCloneDialogComponent } from './collection-clone-dialog.component';

describe('CollectionCloneDialogComponent', () => {
  let component: CollectionCloneDialogComponent;
  let fixture: ComponentFixture<CollectionCloneDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionCloneDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionCloneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
