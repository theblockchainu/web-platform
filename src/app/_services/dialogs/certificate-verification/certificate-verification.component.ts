import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CertificateService } from '../../certificate/certificate.service';
import { CollectionService } from '../../collection/collection.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ProfileService } from '../../profile/profile.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-certificate-verification',
  templateUrl: './certificate-verification.component.html',
  styleUrls: ['./certificate-verification.component.scss']
})
export class CertificateVerificationComponent implements OnInit {
  public signature: any;
  public hashVerified: boolean;
  public loading: boolean;
  verificationSteps: Array<VerificationObject>;
  public transactionId: string;
  public localSHA: string;
  public blockchainHash: string;
  public participantAddress: string;
  public collection: any;
  public accreditation: any;
  public expandedPanel: number;
  public certificateValid: boolean;
  public certificateProcessed: boolean;
  public envVariable: any;

  constructor(
    private certificateService: CertificateService,
    public dialogRef: MatDialogRef<CertificateVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private collectionService: CollectionService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.envVariable = environment;
    this.loading = true;
    this.initializeVerificationSteps();
    this.getCollection()
      .subscribe(res => {
        console.log('Got Collection');
        this.collection = res;
        this.initializeVerification();
      });
    console.log(this.data);

  }

  getCollection() {
    const filter = {
      include: ['owners', 'participants', 'certificate_templates']
    };
    return this.collectionService.getCollectionDetail(this.data.collection.id, filter);
  }

  initializeVerification() {
    this.certificateValid = true;
    this.certificateProcessed = false;
    console.log('initialied Verification');
    this.formatvalidation()
      .flatMap((res: any) => {
        console.log('----->Form Processed');
        if (!res) {
          this.certificateValid = false;
        }
        this.verificationSteps[0].processed = true;
        this.verificationSteps[0].verified = res;
        return this.hashComparison();
      })
      .flatMap(res => {
        console.log('----->Hash Processed');
        if (!res) {
          this.certificateValid = false;
        }
        this.verificationSteps[1].verified = res;
        this.verificationSteps[1].processed = true;
        return this.statusCheck();
      })
      .flatMap(res => {
        console.log('----->Status Processed');
        if (!res) {
          this.certificateValid = false;
        }
        this.verificationSteps[2].verified = res;
        this.verificationSteps[2].processed = true;
        return this.metaDataCheck();
      }).subscribe(res => {
        console.log('----->Meta Processed');
        if (!res) {
          this.certificateValid = false;
        }
        this.verificationSteps[3].verified = res;
        this.verificationSteps[3].processed = true;
        this.certificateProcessed = true;
      });
  }

  getBlockChainTransactionId() {
    return new BehaviorSubject(this.data.signature.anchors[0].sourceId);
  }

  getLocalHash() {
    return new BehaviorSubject(this.hashData());
  }

  fethBlockchainHash() {
    return this.certificateService.getBlockchainHash(this.data.collection.id, this.data.recipient.ethAddress);
  }

  compareHash() {
    return new BehaviorSubject(this.localSHA === this.blockchainHash);
  }

  fetchParticipantAddress() {
    return new BehaviorSubject(this.data.recipient.ethAddress);
  }

  checkParticipantReceipt() {
    return new BehaviorSubject(this.data.signature);
  }

  checkIfDropped() {
    return new BehaviorSubject(
      this.collection.participants.find((peer) => {
        return peer.id === this.data.recipient.id;
      })
    );
  }

  checkIssuerAddress() {
    return new BehaviorSubject(this.collection.owners[0].id === this.data.issuer.id);
  }

  checkExpiry() {
    const currentMoment = moment(this.collection.certificate_templates[0].expiryDate);
    return new BehaviorSubject(
      currentMoment.isAfter(moment())
    );
  }

  verifyAccreditation() {
    const filter = {
      'include': [{ 'accreditationsSubscribed': [{ 'createdBy': { 'profiles': ['work'] } }, 'topics'] }]
    };
    return this.profileService.getPeerData(this.data.issuer.id, filter).map(res => {
      this.accreditation = res.accreditationsSubscribed[0];
      return true;
    });

  }

  fetchGyan() {
    return this.profileService.getGyanBalance(this.data.recipient.id, 'fixed');
  }

  formatvalidation() {
    let formValidated = true;
    return this.getBlockChainTransactionId()
      .flatMap(
        res => {
          console.log('Blockchain transaction processed');
          this.verificationSteps[0].steps[0].processed = true;
          if (res) {
            this.transactionId = res;
            this.verificationSteps[0].steps[0].verified = true;
          } else {
            formValidated = false;
          }
          return this.getLocalHash();
        }
      ).flatMap(res => {
        console.log('Local Hash processed');
        this.verificationSteps[0].steps[1].processed = true;
        if (res) {
          this.localSHA = res;
          this.verificationSteps[0].steps[1].verified = true;

        } else {
          formValidated = false;
        }
        return this.fethBlockchainHash();
      }).flatMap((res: any) => {
        console.log('Fetch Hash processed');
        this.verificationSteps[0].steps[2].processed = true;
        if (res) {
          this.blockchainHash = res;
          this.verificationSteps[0].steps[2].verified = true;
        } else {
          formValidated = false;
        }
        return this.fetchParticipantAddress();
      }).map(res => {
        console.log('Fetch Participant processed');
        this.verificationSteps[0].steps[3].processed = true;
        if (res) {
          this.participantAddress = res;
          this.verificationSteps[0].steps[3].verified = true;
        }
        return formValidated;
      });
  }

  hashComparison() {
    let stepVerified = true;
    return this.compareHash()
      .flatMap(res => {
        console.log('Compare Hash processed');
        this.verificationSteps[1].steps[0].processed = true;
        if (res) {
          this.hashVerified = res;
          this.verificationSteps[1].steps[0].verified = true;
        } else {
          stepVerified = false;
        }
        return this.fetchParticipantAddress();
      })
      .flatMap(res => {
        console.log('Fetch Participant Address processed');
        this.verificationSteps[1].steps[1].processed = true;
        if (res) {
          this.participantAddress = res;
          this.verificationSteps[1].steps[1].verified = true;
        } else {
          stepVerified = false;
        }
        return this.checkParticipantReceipt();
      }).map(res => {
        this.verificationSteps[1].steps[2].processed = true;
        if (res) {
          this.verificationSteps[1].steps[2].verified = true;
        } else {
          stepVerified = false;
        }
        return stepVerified;
      });
  }

  statusCheck() {
    let stepVerified = true;
    return this.checkIfDropped()
      .flatMap(res => {
        console.log('checkidropped');
        this.verificationSteps[2].steps[0].processed = true;
        if (res) {
          this.verificationSteps[2].steps[0].verified = true;
        } else {
          stepVerified = false;
        }
        return this.checkIssuerAddress();
      }).flatMap(res => {
        console.log('checkIssuerAddress');
        this.verificationSteps[2].steps[1].processed = true;
        if (res) {
          this.verificationSteps[2].steps[1].verified = true;
        } else {
          stepVerified = false;
        }
        return this.checkExpiry();
      }).map(res => {
        console.log('checkExpiry');
        this.verificationSteps[2].steps[2].processed = true;
        if (res) {
          this.verificationSteps[2].steps[2].verified = true;
        } else {
          stepVerified = false;
        }
        return stepVerified;
      });
  }

  metaDataCheck() {
    let stepVerified = true;
    return this.verifyAccreditation()
      .flatMap(res => {
        this.verificationSteps[3].steps[0].processed = true;
        if (res) {
          this.verificationSteps[3].steps[0].verified = true;
        } else {
          stepVerified = false;
        }
        return this.fetchGyan();
      }).map(res => {
        this.verificationSteps[3].steps[1].processed = true;
        if (res) {
          this.verificationSteps[3].steps[1].verified = true;
        } else {
          stepVerified = false;
        }
        return stepVerified;
      });
  }

  initializeVerificationSteps() {
    this.verificationSteps = [
      {
        CategoryName: 'Format Validation',
        processed: false,
        verified: false,
        steps: [
          {
            stepName: 'Get blockchain transaction ID from JSON data',
            processed: false,
            verified: false
          },
          {
            stepName: 'Compute local hash',
            processed: false,
            verified: false
          },
          {
            stepName: 'Fetch blockchain hash',
            processed: false,
            verified: false
          },
          {
            stepName: 'Get participant address from JSON data',
            processed: false,
            verified: false
          }
        ]
      },
      {
        CategoryName: 'Hash Comparison',
        processed: false,
        verified: false,
        steps: [
          {
            stepName: 'Compare hashes',
            processed: false,
            verified: false
          },
          {
            stepName: 'Fetch participant info from blockchain',
            processed: false,
            verified: false
          },
          {
            stepName: 'Check participant receipt',
            processed: false,
            verified: false
          }
        ]
      },
      {
        CategoryName: 'Status Check',
        processed: false,
        verified: false,
        steps: [
          {
            stepName: 'Check if participant dropped',
            processed: false,
            verified: false
          },
          {
            stepName: 'Check issuer address matches blockchain record',
            processed: false,
            verified: false
          },
          {
            stepName: 'Expired status check',
            processed: false,
            verified: false
          }
        ]
      },
      {
        CategoryName: 'Metadata Check',
        processed: false,
        verified: false,
        steps: [
          {
            stepName: 'Verify accreditation on blockchain',
            processed: false,
            verified: false
          },
          {
            stepName: 'Fetch Gyan score from blockchain',
            processed: false,
            verified: false
          }
        ]
      }
    ];
  }

  hashData() {
    this.signature = this.data.signature;
    const certificateData = _.cloneDeep(this.data);
    delete certificateData.signature;
    const sha = this.certificateService.getSHA(JSON.stringify(certificateData)).slice(0, 32);
    return sha;
  }

  toggleExpansionpanel(index: number) {
    if (this.expandedPanel === index) {
      this.expandedPanel = -1;
    } else {
      this.expandedPanel = index;
    }
  }
}


interface VerificationObject {
  processed: boolean;
  verified: boolean;
  CategoryName: string;
  steps?: Array<{
    stepName: string;
    stepDescription?: string;
    processed: boolean;
    verified: boolean;
  }>;
}
