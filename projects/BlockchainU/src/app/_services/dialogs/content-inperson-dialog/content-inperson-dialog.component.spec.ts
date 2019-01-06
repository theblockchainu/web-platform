import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentInpersonDialogComponent } from './content-inperson-dialog.component';

describe('ContentInpersonDialogComponent', () => {
  let component: ContentInpersonDialogComponent;
  let fixture: ComponentFixture<ContentInpersonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentInpersonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentInpersonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
