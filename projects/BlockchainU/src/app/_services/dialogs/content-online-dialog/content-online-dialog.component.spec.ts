import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentOnlineDialogComponent } from './content-online-dialog.component';

describe('ContentOnlineDialogComponent', () => {
  let component: ContentOnlineDialogComponent;
  let fixture: ComponentFixture<ContentOnlineDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentOnlineDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentOnlineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
