import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleProfileEditComponent } from './console-profile-edit.component';

describe('ConsoleProfileEditComponent', () => {
  let component: ConsoleProfileEditComponent;
  let fixture: ComponentFixture<ConsoleProfileEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleProfileEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
