import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CertificateService } from '../../certificate/certificate.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-certificate-verification',
  templateUrl: './certificate-verification.component.html',
  styleUrls: ['./certificate-verification.component.scss']
})
export class CertificateVerificationComponent implements OnInit {
  public signature: any;
  public verified: boolean;
  public loading: boolean;

  constructor(
    private certificateService: CertificateService,
    public dialogRef: MatDialogRef<CertificateVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.verified = false;
    this.hashData();
  }

  hashData() {
    this.signature = this.data.signature;
    const certificateData = _.cloneDeep(this.data);
    delete certificateData.signature;
    const sha = this.certificateService.getSHA(JSON.stringify(certificateData)).slice(0, 32);
    console.log(sha);
    this.certificateService.getBlockchainHash(this.data.collection.id, this.data.recipient.ethAddress)
      .subscribe((res: any) => {
        console.log(res);
        if (res === sha) {
          this.verified = true;
          console.log('Its a match');
          this.loading = false;
        } else {
          console.log('err');
        }
      });
  }
}
