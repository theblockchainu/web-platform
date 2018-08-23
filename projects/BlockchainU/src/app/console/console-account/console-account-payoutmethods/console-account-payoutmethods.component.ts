import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleAccountComponent } from '../console-account.component';
import { PaymentService } from '../../../_services/payment/payment.service';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../../../environments/environment';
@Component({
  selector: 'app-console-account-payoutmethods',
  templateUrl: './console-account-payoutmethods.component.html',
  styleUrls: ['./console-account-payoutmethods.component.scss']
})
export class ConsoleAccountPayoutmethodsComponent implements OnInit {
  public loading: boolean;
  public loadingRules: boolean;
  public payoutAccounts: Array<any>;
  public userId: string;
  public envVariable;
  public ownedCollections: Array<any>;
  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleAccountComponent: ConsoleAccountComponent,
    private _paymentService: PaymentService,
    private location: Location,
    public router: Router,
    private _collectionService: CollectionService,
    private _cookieUtilsService: CookieUtilsService
  ) {
      this.envVariable = environment;
    this.loading = true;
    this.loadingRules = true;
    this.userId = this._cookieUtilsService.getValue('userId');
    this.activatedRoute.pathFromRoot[4].queryParams.subscribe(params => {
      if (params['code']) {
        this.addAccount(params['code'], params['state']);
        this.location.replaceState(this.location.path().split('?')[0]);
      } else {
        this.retrieveAccounts();
      }

    });
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });

  }

  addAccount(code: string, state?: string) {
    this._paymentService.createConnectedAccount(code).subscribe((result: any) => {
      if (state) {
        location.href = state;
      }
      this.retrieveAccounts();
    }, err => {
      console.log(err);
      this.location.replaceState('');
    });
  }

  ngOnInit() {
  }

  private retrievePayoutRules(payoutAccounts) {
    const query = { 'include': 'payoutrules' };
    this.ownedCollections = [];
    this._collectionService.getOwnedCollections(this.userId, JSON.stringify(query), (err, res) => {
      if (err) {
        console.log(err);
      } else {
        res.forEach(collection => {
          payoutAccounts.forEach(account => {
            if (collection.payoutrules && collection.payoutrules.length > 0 && account.payoutaccount.id === collection.payoutrules[0].payoutId1) {
              collection.payoutrules[0].external_account = account.external_accounts.data[0];
            }
          });
          this.ownedCollections.push(collection);
        });
        this.loadingRules = false;
      }
    });
  }

  private retrieveAccounts() {
    this.payoutAccounts = [];
    this._paymentService.retrieveConnectedAccount().subscribe((result: any) => {
      result.forEach(account => {
        this.payoutAccounts = this.payoutAccounts.concat(account.external_accounts.data);
      });
      this.loading = false;
      this.retrievePayoutRules(result);
    }, err => {
      console.log(err);
      this.loading = false;
    });
  }

  /**
   * editAccount
   */
  public editAccount(accountId: string) {
    this._paymentService.createLoginLink(accountId).subscribe(
      (result: any) => {
        window.location.href = result.url;
      }, err => {
        console.log(err);
      }
    );
  }

  public editPayout(collectionId: string) {
    this.router.navigateByUrl('/class/' + collectionId + '/edit/17');
  }
}
