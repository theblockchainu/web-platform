import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { CommunityService } from '../../community/community.service';
import { SearchService } from '../../search/search.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { ProfileService } from '../../profile/profile.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CollectionService } from '../../collection/collection.service';
import { PromocodeService } from '../../promocode/promocode.service';
@Component({
  selector: 'app-add-promo-code-dialog',
  templateUrl: './add-promo-code-dialog.component.html',
  styleUrls: ['./add-promo-code-dialog.component.scss']
})
export class AddPromoCodeDialogComponent implements OnInit {

  public promoCodeForm: FormGroup;
  public searchOptions: Array<any>;
  public myControl = new FormControl('');
  public userId: string;
  public options: Array<any>;
  public selectedPeers: Array<PeerObject>;
  public filteredPeer: Observable<Array<any>>;
  public allPeer = true;
  public discountTypes: Array<string>;
  public availableCurrencies: Array<any>;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  public envVariable: any;
  public loadingData: boolean;
  public data: any;
  public collectionId: string;
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  @ViewChild('peerInput') peerInput: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private _communityService: CommunityService,
    public dialogRef: MatDialogRef<AddPromoCodeDialogComponent>,
    private matSnackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public formdata: any,
    public _searchService: SearchService,
    private _CookieUtilsService: CookieUtilsService,
    private _profileService: ProfileService,
    public _collectionService: CollectionService,
    private promocodeService: PromocodeService) {
  }

  ngOnInit() {
    this.userId = this._CookieUtilsService.getValue('userId');
    this.envVariable = environment;
    this.data = (this.formdata.promoCodeData) ? this.formdata.promoCodeData : {};
    this.collectionId = this.formdata.collectionId;

    this.promoCodeForm = this._fb.group({
      code: this.data.code ? this.data.code : '',
      description: this.data.description ? this.data.description : '',
      discountType: this.data.discountType ? this.data.discountType : '',
      discountCurrency: this.data.discountCurrency ? this.data.discountCurrency : '',
      discountValue: this.data.discountValue ? this.data.discountValue : '',
      validFrom: this.data.validFrom ? this.data.validFrom : '',
      validTo: this.data.validTo ? this.data.validTo : ''
    });
    this.myControl.valueChanges.subscribe((value) => {
      console.log(value);
      if (value.length > 0) {
        this._searchService.getPeerSearchResults(value).subscribe((result: any) => {
          console.log(result);
          this.options = result;
        }, err => {
          console.log(err);
        });
      } else {
        this.options = [];
      }
    });
    this.discountTypes = ['percentage', 'absolute'];
    this.selectedPeers = [];
  }

  public submitForm() {
    this.loadingData = true;
    if (this.data.id) {
      this.promocodeService.patchPromoCode(this.data.id,
        this.promoCodeForm.value).subscribe(res => {
          this.loadingData = false;
          this.matSnackBar.open('Code Updated', 'Close', { duration: 3000 });
          this.dialogRef.close();
        }, err => {
          this.matSnackBar.open('Error in adding the code. Try again?', 'Retry', { duration: 3000 }).onAction().subscribe(res => {
            this.submitForm();
          });
        });
    } else {
      this._collectionService.addPromoCode(this.collectionId,
        this.promoCodeForm.value).subscribe(res => {
          this.loadingData = false;
          this.matSnackBar.open('Code Added', 'Close', { duration: 3000 });
          this.dialogRef.close();
        }, err => {
          this.matSnackBar.open('Error in adding the code. Try again?', 'Retry', { duration: 3000 }).onAction().subscribe(res => {
            this.submitForm();
          });
        });
    }

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
  }

}

interface PeerObject {
  id: string;
  name: string;
}
