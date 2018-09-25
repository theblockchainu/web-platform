import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AskQuestionDialogComponent } from './ask-question-dialog.component';

describe('AskQuestionDialogComponent', () => {
  let component: AskQuestionDialogComponent;
  let fixture: ComponentFixture<AskQuestionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AskQuestionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AskQuestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
