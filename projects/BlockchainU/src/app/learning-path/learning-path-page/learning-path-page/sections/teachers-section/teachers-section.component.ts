import { Component, OnInit, Input, ViewChildren, QueryList, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-teachers-section',
  templateUrl: './teachers-section.component.html',
  styleUrls: ['./teachers-section.component.scss']
})

export class TeachersSectionComponent implements OnChanges, OnInit {
  @Input() learningPath: any;
  private _learningPath: any;

  teachers: Array<any>;

  constructor(
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    const learningPath: SimpleChange = changes.learningPath;
    console.log('prev value: ', learningPath.previousValue);
    console.log('got name: ', learningPath.currentValue);
    // this._name = name.currentValue.toUpperCase();
    console.log(changes);
    console.log(this.learningPath);
    if (this.learningPath) {
      this.teachers = [];
      this.learningPath.contents.forEach(content => {
        const topics = [];
        if (content.courses[0].owners[0].topicsTeaching) {
          content.courses[0].owners[0].topicsTeaching.forEach(topicObj => {
            topics.push(topicObj.name);
          });
        }
        content.courses[0].owners[0].topics = topics;
        this.teachers.push(content.courses[0].owners[0]);
      });
    }
    console.log(this.teachers);
  }

  ngOnInit() {
  }

}
