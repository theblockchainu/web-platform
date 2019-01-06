import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentInpersonComponent } from './content-inperson.component';

describe('ContentInpersonComponent', () => {
  let component: ContentInpersonComponent;
  let fixture: ComponentFixture<ContentInpersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentInpersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentInpersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
