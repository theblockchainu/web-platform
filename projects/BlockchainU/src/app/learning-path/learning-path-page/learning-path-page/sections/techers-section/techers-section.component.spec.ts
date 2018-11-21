import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TechersSectionComponent } from './techers-section.component';

describe('TechersSectionComponent', () => {
  let component: TechersSectionComponent;
  let fixture: ComponentFixture<TechersSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TechersSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TechersSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
