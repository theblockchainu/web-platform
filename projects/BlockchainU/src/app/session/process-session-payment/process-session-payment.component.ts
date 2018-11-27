import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../_services/content/content.service';
import { map, flatMap, first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-process-session-payment',
  templateUrl: './process-session-payment.component.html',
  styleUrls: ['./process-session-payment.component.scss']
})
export class ProcessSessionPaymentComponent implements OnInit {

  // ONLY USED FOR CC AVENUE

  private paymentBatchId: string;
  private paymentStatus: string;
  private statusMessage: string;
  private failureMessage: string;
  savingData: boolean;
  ccavenueReady: boolean;
  userId: string;
  message: string;
  transactionId: string;

  constructor(
    private contentService: ContentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _cookieUtilsService: CookieUtilsService,
    private matSnackBar: MatSnackBar,
    private _contentService: ContentService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(first()).subscribe(params => {
      if (params['paymentStatus']) {
        this.paymentStatus = params['paymentStatus'];
        this.statusMessage = params['statusMessage'];
        this.failureMessage = params['failureMessage'];
        this.paymentBatchId = params['paymentBatch'];
        this.transactionId = params['transactionId'];
        console.log('Payment status: ' + this.paymentStatus);
        this.actOnPaymentStatus();
      }
    });
  }

  private actOnPaymentStatus() {
    this.savingData = true;
    if (this.paymentStatus !== undefined) {
      this.userId = this._cookieUtilsService.getValue('userId');
      console.log('Refreshed USER ID: ' + this.userId);
      if (this.paymentStatus === 'Success') {
        console.log('Payment success. Joining collection and redirecting.');
        this.message = 'Payment successful. Processing...';
        this.savepayment();
      } else {
        console.log('Payment unsuccessful.');
        const message = this.statusMessage && this.statusMessage.length > 0 && this.statusMessage !== 'null' ? this.statusMessage : 'An error occurred.';
        this.matSnackBar.open(message, 'Retry')
          .onAction().subscribe(res => {
            this.router.navigate(['home', 'peers']);
            this.paymentStatus = undefined;
            this.savingData = false;
          });
      }
    }
  }

  private savepayment() {
    const query = {
      'where': {
        'paymentBatch': this.paymentBatchId
      },
      'include': ['payments']
    };
    console.log(query);
    const requestArray = [];
    console.log(this.transactionId);
    this.contentService.getContents(query).pipe(flatMap((res: any) => {
      res.forEach(content => {
        if (content.payments && content.payments.length > 0) {
          const paymentIndex = content.payments.findIndex((val) => {
            return val.id === this.transactionId;
          });
          if (paymentIndex < 0) {
            requestArray.push(
              this.contentService.linkPayment(content.id, this.transactionId)
            );
          }
        } else {
          requestArray.push(
            this.contentService.linkPayment(content.id, this.transactionId)
          );
        }
      });
      return forkJoin(requestArray);
    })).subscribe(res => {
      this.router.navigate(['console', 'learning', 'sessions']);
    }, err => {
      this.message = 'Error Please contact support';
    });


  }


}
