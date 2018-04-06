import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxDialogComponent } from './inbox-dialog.component';

describe('InboxDialogComponent', () => {
  let component: InboxDialogComponent;
  let fixture: ComponentFixture<InboxDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboxDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
