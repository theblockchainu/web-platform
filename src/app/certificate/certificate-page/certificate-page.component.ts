import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CertificateService } from '../../_services/certificate/certificate.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-certificate-page',
  templateUrl: './certificate-page.component.html',
  styleUrls: ['./certificate-page.component.scss']
})
export class CertificatePageComponent implements OnInit {

  certificate: any;
  initialised: boolean;
  certificateId: string;
  userId: string;
  accountApproved: string;
  loadingCertificate: boolean;
  certificateHTML: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private _cookieUtilsService: CookieUtilsService,
    private router: Router,
    private dialogsService: DialogsService,
    private matSnackBar: MatSnackBar,
    private certificateService: CertificateService,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (this.initialised && (this.certificateId !== params['certificateId'])) {
        location.reload();
      }
      this.certificateId = params['certificateId'];
    });
    this.userId = this._cookieUtilsService.getValue('userId');
    this.initialised = true;
    this.initializePage();
    this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
  }

  initializePage() {
    this.certificateService.getCertificate(this.certificateId).subscribe((res: any) => {
      this.certificate = JSON.parse(res.stringifiedJSON);
      this.loadingCertificate = false;
      console.log(this.certificate);
    });
  }

  verify() {
    this.dialogsService.verifyCertificateDialog(this.certificate).subscribe();
  }

}
