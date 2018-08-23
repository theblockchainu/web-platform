import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitEntryComponent } from './submit-entry.component';

describe('SubmitEntryComponent', () => {
  let component: SubmitEntryComponent;
  let fixture: ComponentFixture<SubmitEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
