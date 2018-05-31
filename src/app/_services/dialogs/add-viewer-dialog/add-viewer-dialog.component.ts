import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchService } from '../../search/search.service';
import { environment } from '../../../../environments/environment';
import { CollectionService } from '../../collection/collection.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-viewer-dialog',
  templateUrl: './add-viewer-dialog.component.html',
  styleUrls: ['./add-viewer-dialog.component.scss']
})
export class AddViewerDialogComponent implements OnInit {
  public selectedPeers: Array<PeerObject>;
  @ViewChild('peerInput') peerInput: ElementRef;
  selectable = true;
  removable = true;
  addOnBlur = true;
  public envVariable;

  public myControl = new FormControl('');
  public searchOptions: Array<any>;

  constructor(
    public _searchService: SearchService,
    public _collectionService: CollectionService,
    public dialogRef: MatDialogRef<AddViewerDialogComponent>
  ) {
    this.envVariable = environment;
  }

  ngOnInit() {
    this.selectedPeers = [];
    this.myControl.valueChanges
      .subscribe((value) => {
        if (value) {
          this._searchService.getPeerSearchResults(value)
            .subscribe((res: any) => {
              console.log(res);
              this.searchOptions = res;
            });
        }
      });
  }


  removePeer(peer: any): void {
    const index = this.selectedPeers.indexOf(peer);

    if (index >= 0) {
      this.selectedPeers.splice(index, 1);
    }
  }

  onSearchOptionClicked(data: any): void {
    console.log(data);
    this.selectedPeers.push(
      {
        id: data.id,
        name: data.profiles[0].first_name + ' ' + data.profiles[0].last_name
      }
    );
    console.log(this.selectedPeers);
    this.peerInput.nativeElement.value = '';
  }

  closeDialog() {
    console.log(this.selectedPeers);
    this.dialogRef.close(this.selectedPeers);
  }
}


interface PeerObject {
  id: string;
  name: string;
}
