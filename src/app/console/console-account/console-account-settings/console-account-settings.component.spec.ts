import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountSettingsComponent } from './console-account-settings.component';

describe('ConsoleAccountSettingsComponent', () => {
  let component: ConsoleAccountSettingsComponent;
  let fixture: ComponentFixture<ConsoleAccountSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
