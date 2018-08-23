import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleDashboardComponent } from './console-dashboard.component';

describe('ConsoleDashboardComponent', () => {
  let component: ConsoleDashboardComponent;
  let fixture: ComponentFixture<ConsoleDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
