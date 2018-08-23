import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningKnowledgeStoryComponent } from './console-learning-knowledge-story.component';

describe('ConsoleLearningKnowledgeStoryComponent', () => {
	let component: ConsoleLearningKnowledgeStoryComponent;
	let fixture: ComponentFixture<ConsoleLearningKnowledgeStoryComponent>;
	
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ConsoleLearningKnowledgeStoryComponent ]
		})
			.compileComponents();
	}));
	
	beforeEach(() => {
		fixture = TestBed.createComponent(ConsoleLearningKnowledgeStoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
