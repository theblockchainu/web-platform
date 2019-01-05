import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
	selector: 'app-teachers-section',
	templateUrl: './teachers-section.component.html',
	styleUrls: ['./teachers-section.component.scss']
})

export class TeachersSectionComponent implements OnChanges, OnInit {
	@Input() learningPath: any;
	private _learningPath: any;
	loadingPeers: boolean;
	
	teachers: Array<any>;
	
	constructor(
	) {
	
	}
	
	ngOnChanges() {
		this.createTeachersArray();
	}
	
	ngOnInit() {
	}
	
	createTeachersArray() {
		this.loadingPeers = true;
		if (this.learningPath) {
			this.teachers = [];
			this.learningPath.contents.forEach(content => {
				const topics = [];
				console.log('checking_content');
				console.log(content);
				if (content.courses[0] && content.courses[0].owners && content.courses[0].owners[0]) {
					console.log('checking_teacher');
					if (content.courses[0].owners[0].topicsTeaching) {
						content.courses[0].owners[0].topicsTeaching.forEach(topicObj => {
							topics.push(topicObj.name);
						});
						content.courses[0].owners[0].topics = topics;
					} else {
						content.courses[0].owners[0].topics = [];
					}
					const found = this.teachers.findIndex(teacher => {
						return teacher.id === content.courses[0].owners[0].id;
					});
					if (found === -1) {
						this.teachers.push(content.courses[0].owners[0]);
					}
				}
			});
		}
		this.loadingPeers = false;
	}
}
