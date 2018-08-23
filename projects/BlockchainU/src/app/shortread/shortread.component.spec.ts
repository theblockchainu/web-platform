import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortreadComponent } from './shortread.component';

describe('ShortreadComponent', () => {
  let component: ShortreadComponent;
  let fixture: ComponentFixture<ShortreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
