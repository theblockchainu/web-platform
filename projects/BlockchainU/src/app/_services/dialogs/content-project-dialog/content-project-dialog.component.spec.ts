import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentProjectDialogComponent } from './content-project-dialog.component';

describe('ContentProjectDialogComponent', () => {
  let component: ContentProjectDialogComponent;
  let fixture: ComponentFixture<ContentProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentProjectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
