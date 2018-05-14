import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCommunityDialogComponent } from './request-community-dialog.component';

describe('RequestCommunityDialogComponent', () => {
  let component: RequestCommunityDialogComponent;
  let fixture: ComponentFixture<RequestCommunityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestCommunityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestCommunityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
