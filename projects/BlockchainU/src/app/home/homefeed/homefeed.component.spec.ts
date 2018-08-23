import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomefeedComponent } from './homefeed.component';

describe('HomefeedComponent', () => {
  let component: HomefeedComponent;
  let fixture: ComponentFixture<HomefeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomefeedComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomefeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
