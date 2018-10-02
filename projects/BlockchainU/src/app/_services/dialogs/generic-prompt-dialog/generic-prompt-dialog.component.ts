import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-generic-prompt-dialog',
  templateUrl: './generic-prompt-dialog.component.html',
  styleUrls: ['./generic-prompt-dialog.component.scss']
})
export class GenericPromptDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GenericPromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

}
