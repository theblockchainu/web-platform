import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentVideoDialogComponent } from './content-video-dialog.component';

describe('ContentVideoDialogComponent', () => {
  let component: ContentVideoDialogComponent;
  let fixture: ComponentFixture<ContentVideoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentVideoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
