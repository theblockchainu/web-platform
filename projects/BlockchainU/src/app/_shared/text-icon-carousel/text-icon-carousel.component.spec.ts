import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextIconCarouselComponent } from './text-icon-carousel.component';

describe('TextIconCarouselComponent', () => {
  let component: TextIconCarouselComponent;
  let fixture: ComponentFixture<TextIconCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextIconCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextIconCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
