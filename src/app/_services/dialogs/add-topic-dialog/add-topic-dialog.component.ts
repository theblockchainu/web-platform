import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig, MatIconModule, MAT_DIALOG_DATA } from '@angular/material';
import {
  FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators
} from '@angular/forms';
import { TopicService } from '../../../_services/topic/topic.service';

@Component({
  selector: 'app-add-topic-dialog',
  templateUrl: './add-topic-dialog.component.html',
  styleUrls: ['./add-topic-dialog.component.scss']
})
export class AddTopicDialogComponent implements OnInit {
  public newTopic: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddTopicDialogComponent>,
              public _topicService: TopicService,
              private _fb: FormBuilder) { }

  ngOnInit() {
    this.newTopic = this._fb.group({
      topicName: ['', Validators.required]
    });
  }

  addNewTopic() {
    this._topicService.addNewTopic(this.newTopic.controls['topicName'].value)
        .map((res) => {
          this.dialogRef.close(res);
        })
        .subscribe();
  }

}
