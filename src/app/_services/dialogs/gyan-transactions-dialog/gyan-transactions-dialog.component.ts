import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-gyan-transactions-dialog',
  templateUrl: './gyan-transactions-dialog.component.html',
  styleUrls: ['./gyan-transactions-dialog.component.scss']
})
export class GyanTransactionsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GyanTransactionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
  }

}
