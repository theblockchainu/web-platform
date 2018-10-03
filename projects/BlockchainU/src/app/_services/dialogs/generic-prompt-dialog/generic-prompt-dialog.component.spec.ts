import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPromptDialogComponent } from './generic-prompt-dialog.component';

describe('GenericPromptDialogComponent', () => {
  let component: GenericPromptDialogComponent;
  let fixture: ComponentFixture<GenericPromptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericPromptDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericPromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
