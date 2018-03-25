import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-message-participant',
  templateUrl: './message-participant.component.html',
  styleUrls: ['./message-participant.component.scss']
})
export class MessageParticipantComponent implements OnInit {
  public messageForm: FormGroup;

  constructor(private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.messageForm = this._fb.group({
      message: ['', Validators.required],
      sent: ''
    });
  }

  /**
   * sendMessage
   */
  public sendMessage() {
    console.log(this.messageForm.value);
    this.messageForm.reset();
    console.log('sent');
  }

}
