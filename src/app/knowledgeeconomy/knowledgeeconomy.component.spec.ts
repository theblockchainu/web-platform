import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeeconomyComponent } from './knowledgeeconomy.component';

describe('KnowledgeeconomyComponent', () => {
  let component: KnowledgeeconomyComponent;
  let fixture: ComponentFixture<KnowledgeeconomyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeeconomyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeeconomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
