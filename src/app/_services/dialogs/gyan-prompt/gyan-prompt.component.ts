import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-gyan-prompt',
  templateUrl: './gyan-prompt.component.html',
  styleUrls: ['./gyan-prompt.component.scss']
})
export class GyanPromptComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GyanPromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

  continue(response: boolean) {
    this.dialogRef.close(response);
  }
}
