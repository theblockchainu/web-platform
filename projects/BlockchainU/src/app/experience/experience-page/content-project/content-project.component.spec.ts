
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentProjectComponent } from './content-project.component';

describe('ContentProjectComponent', () => {
  let component: ContentProjectComponent;
  let fixture: ComponentFixture<ContentProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
