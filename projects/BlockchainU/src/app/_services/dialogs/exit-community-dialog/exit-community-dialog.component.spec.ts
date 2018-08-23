import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitCommunityDialogComponent } from './exit-community-dialog.component';

describe('ExitCommunityDialogComponent', () => {
  let component: ExitCommunityDialogComponent;
  let fixture: ComponentFixture<ExitCommunityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExitCommunityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitCommunityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
