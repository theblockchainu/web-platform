import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNotificationDialogComponent } from './app-notification-dialog.component';

describe('AppNotificationDialogComponent', () => {
  let component: AppNotificationDialogComponent;
  let fixture: ComponentFixture<AppNotificationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppNotificationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNotificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
