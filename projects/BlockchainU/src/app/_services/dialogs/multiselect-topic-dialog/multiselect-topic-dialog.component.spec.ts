import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectTopicDialogComponent } from './multiselect-topic-dialog.component';

describe('MultiselectTopicDialogComponent', () => {
  let component: MultiselectTopicDialogComponent;
  let fixture: ComponentFixture<MultiselectTopicDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiselectTopicDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiselectTopicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
