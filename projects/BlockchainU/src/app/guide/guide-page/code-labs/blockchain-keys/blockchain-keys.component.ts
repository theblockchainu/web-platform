import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-blockchain-keys',
  templateUrl: './blockchain-keys.component.html',
  styleUrls: ['./blockchain-keys.component.scss']
})
export class BlockchainKeysComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BlockchainKeysComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

}
