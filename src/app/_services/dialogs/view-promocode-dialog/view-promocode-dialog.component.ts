import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { AddPromoCodeDialogComponent } from '../add-promo-code-dialog/add-promo-code-dialog.component';
import { PromocodeService } from '../../promocode/promocode.service';
@Component({
  selector: 'app-view-promocode-dialog',
  templateUrl: './view-promocode-dialog.component.html',
  styleUrls: ['./view-promocode-dialog.component.scss']
})
export class ViewPromocodeDialogComponent implements OnInit {

  public promoCodes: Array<any>;

  constructor(
    private collectionService: CollectionService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private promocodeService: PromocodeService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.fetchCodes();
  }

  fetchCodes() {
    const filter = {
      'include': ['peersAllowed', 'appliedBy']
    };
    this.collectionService.getPromoCodes(this.data, filter).subscribe((res: any) => {
      this.promoCodes = res;
    });
  }

  edit(promo: any) {
    this.dialog.open(AddPromoCodeDialogComponent, {
      data: { collectionId: this.data, promoCodeData: promo },
      panelClass: 'responsive-dialog',
      width: '55vw',
      height: '80vh'
    }).afterClosed().subscribe(res => {
      this.fetchCodes();
    })
  }

  delete(promo: any) {
    this.promocodeService.deletePromoCode(promo.id).subscribe(res => {
      this.matSnackBar.open('Deleted', 'Close', { duration: 3000 });
      this.fetchCodes();
    });
  }

}
