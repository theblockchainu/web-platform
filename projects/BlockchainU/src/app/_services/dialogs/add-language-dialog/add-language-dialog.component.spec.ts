import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLanguageDialogComponent } from './add-language-dialog.component';

describe('AddTopicDialogComponent', () => {
  let component: AddLanguageDialogComponent;
  let fixture: ComponentFixture<AddLanguageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLanguageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLanguageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
