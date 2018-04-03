import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-select-duration-component',
  templateUrl: './select-duration-component.component.html',
  styleUrls: ['./select-duration-component.component.scss']
})
export class SelectDurationComponentComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<SelectDurationComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit() {
    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.data);
    });
  }

}
