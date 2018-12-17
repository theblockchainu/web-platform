import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-blockchain-keys',
  templateUrl: './blockchain-keys.component.html',
  styleUrls: ['./blockchain-keys.component.scss']
})
export class BlockchainKeysComponent implements OnInit {

  keysArray: Array<KeyObject>;

  constructor(
    public dialogRef: MatDialogRef<BlockchainKeysComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.keysArray = [];
    for (const key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        this.keysArray.push(
          {
            publicKey: key,
            privateKey: this.data[key]
          }
        );
      }
    }
  }

}

interface KeyObject {
  publicKey: string;
  privateKey: string;
}
