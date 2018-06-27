import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CertificateService } from '../../certificate/certificate.service';
@Component({
  selector: 'app-certificate-verification',
  templateUrl: './certificate-verification.component.html',
  styleUrls: ['./certificate-verification.component.scss']
})
export class CertificateVerificationComponent implements OnInit {

  constructor(
    private certificateService: CertificateService,
    public dialogRef: MatDialogRef<CertificateVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.certificateService.getBlockchainHash(this.data.collection.id, this.data.recipient.ethAddress).subscribe(res => {
      console.log(res);
    });
  }

}
