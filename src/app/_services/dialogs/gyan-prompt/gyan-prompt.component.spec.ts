import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GyanPromptComponent } from './gyan-prompt.component';

describe('GyanPromptComponent', () => {
  let component: GyanPromptComponent;
  let fixture: ComponentFixture<GyanPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GyanPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GyanPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
