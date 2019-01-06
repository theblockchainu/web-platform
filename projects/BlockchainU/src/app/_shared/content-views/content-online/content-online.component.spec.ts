import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentOnlineComponent } from './content-online.component';

describe('ContentOnlineComponent', () => {
  let component: ContentOnlineComponent;
  let fixture: ComponentFixture<ContentOnlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentOnlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
