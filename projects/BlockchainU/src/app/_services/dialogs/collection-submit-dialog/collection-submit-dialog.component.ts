import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-collection-submit-dialog',
  templateUrl: './collection-submit-dialog.component.html',
  styleUrls: ['./collection-submit-dialog.component.scss']
})

export class CollectionSubmitDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CollectionSubmitDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

  public closeDialog() { 
    this.dialogRef.close('close');
    if (this.data.type === 'class') {
      this.router.navigate(['console', 'teaching', this.data.type + 'es']);
    } else if (this.data.type === 'bounty') {
      this.router.navigate(['console', 'teaching', 'bounties']);
    }    else {
      this.router.navigate(['console', 'teaching', this.data.type + 's']);
    }
  }

}
