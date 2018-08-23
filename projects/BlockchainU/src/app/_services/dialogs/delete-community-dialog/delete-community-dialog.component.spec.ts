import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCommunityDialogComponent } from './delete-community-dialog.component';

describe('DeleteCommunityDialogComponent', () => {
  let component: DeleteCommunityDialogComponent;
  let fixture: ComponentFixture<DeleteCommunityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteCommunityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteCommunityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
