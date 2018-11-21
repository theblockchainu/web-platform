import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, QueryList, ViewChildren } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { CertificateService } from '../../../../../_services/certificate/certificate.service';

@Component({
  selector: 'app-path-section',
  templateUrl: './path-section.component.html',
  styleUrls: ['./path-section.component.scss']
})
export class PathSectionComponent implements OnChanges, OnInit {
  @Input() learningPath: any;
  envVariable: any;
  certificateHTML: string;
  private certificateDomSubscription;
  loadingCertificate: boolean;
  @ViewChildren('certificateDomHTML') certificateDomHTML: QueryList<any>;

  constructor(
    private _certificateService: CertificateService
  ) {
    this.envVariable = environment;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const learningPath: SimpleChange = changes.learningPath;
    console.log('prev value: ', learningPath.previousValue);
    console.log('got name: ', learningPath.currentValue);
    // this._name = name.currentValue.toUpperCase();
    console.log(changes);
    console.log(this.learningPath);
    this.getCertificatetemplate();
  }

  private getCertificatetemplate() {
    this.loadingCertificate = true;
    if (this.learningPath) {
      this._certificateService.getCertificateTemplate(this.learningPath.id).subscribe((res: any) => {
        if (res !== null && res !== undefined) {
          this.certificateHTML = res.certificateHTML;
          this.certificateDomSubscription = this.certificateDomHTML.changes.subscribe(elem => {
            if (elem['first']) {
              const image = elem['first'].nativeElement.children[0].children[0].children[1].children[0];
              image.src = '/assets/images/theblockchainu-qr.png';
            }
          });
        }
        this.loadingCertificate = false;
      });
    }
  }

}
