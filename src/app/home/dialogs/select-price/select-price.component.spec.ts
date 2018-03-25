import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPriceComponent } from './select-price.component';

describe('SelectPriceComponent', () => {
  let component: SelectPriceComponent;
  let fixture: ComponentFixture<SelectPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
