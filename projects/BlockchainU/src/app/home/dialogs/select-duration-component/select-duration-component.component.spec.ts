import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDurationComponentComponent } from './select-duration-component.component';

describe('SelectDurationComponentComponent', () => {
  let component: SelectDurationComponentComponent;
  let fixture: ComponentFixture<SelectDurationComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDurationComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDurationComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
