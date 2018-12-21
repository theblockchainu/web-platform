import { Component, OnInit, Input, OnChanges, SimpleChanges, QueryList, ViewChildren } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { CertificateService } from '../../../../../_services/certificate/certificate.service';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import * as moment from 'moment';
import { CookieUtilsService } from '../../../../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
declare var fbq;
@Component({
  selector: 'app-path-section',
  templateUrl: './path-section.component.html',
  styleUrls: ['./path-section.component.scss']
})
export class PathSectionComponent implements OnChanges, OnInit {
  @Input() learningPath: any;
  @Input() joined: boolean;
  envVariable: any;
  certificateHTML: string;
  private certificateDomSubscription;
  loadingCertificate: boolean;
  @ViewChildren('certificateDomHTML') certificateDomHTML: QueryList<any>;
  hourMapping: { [k: string]: string };
  projectMapping: { [k: string]: string };
  inPersonSessionMapping: { [k: string]: string };
  onlineSessionMapping: { [k: string]: string };
  private userId: string;


  constructor(
    private _certificateService: CertificateService,
    private _collectionService: CollectionService,
    private _cookieService: CookieUtilsService,
    private snackBar: MatSnackBar
  ) {
    this.envVariable = environment;
  }

  ngOnInit() {
    this.hourMapping = { '=0': 'Less than an hour of learning', '=1': 'One hour of learning', 'other': '# hours of learning' };
    this.projectMapping = { '=0': 'No projects', '=1': 'One project', 'other': '# projects' };
    this.inPersonSessionMapping = { '=0': 'No in-person activity', '=1': 'One in-person activity', 'other': '# in-person activities' };
    this.onlineSessionMapping = { '=0': 'No live activity', '=1': 'One live activity', 'other': '# online activity' };
  }

  ngOnChanges() {
    this.userId = this._cookieService.getValue('userId');
    this.formatDiplayData();
    this.getCertificatetemplate();
  }

  private formatDiplayData() {
    this.learningPath.contents.map(learningPathContent => {
      // add duration to guides and bounties
      if (learningPathContent.courses && learningPathContent.courses.length > 0) {
        const collection = learningPathContent.courses[0];
        if (collection.bookmarks) {
          collection.bookmarks.forEach(bookmark => {
            if (bookmark.peer && bookmark.peer.length > 0 && this.userId === bookmark.peer[0].id) {
              collection.bookmarkId = bookmark.id;
              console.log('Bookmark Added');
            }
          });
        }

        if (collection.type === 'guide' || collection.type === 'bounty') {
          collection.totalHours = this._collectionService.calculateDuration(collection.description.length);
        }

        if (collection.owners && collection.owners[0].reviewsAboutYou) {
          collection.rating = this._collectionService.calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
          collection.ratingCount = this._collectionService.calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
        }

        if (collection.type === 'experience' && collection.contents) {
          let experienceLocation = 'Unknown location';
          let lat = 37.5293864;
          let lng = -122.008471;
          collection.contents.forEach(experienceContent => {
            if (experienceContent.locations && experienceContent.locations.length > 0
              && experienceContent.locations[0].city !== undefined
              && experienceContent.locations[0].city.length > 0
              && experienceContent.locations[0].map_lat !== undefined
              && experienceContent.locations[0].map_lat.length > 0) {
              experienceLocation = experienceContent.locations[0].city;
              lat = parseFloat(experienceContent.locations[0].map_lat);
              lng = parseFloat(experienceContent.locations[0].map_lng);
            }
          });
          collection.location = experienceLocation;
          collection.lat = lat;
          collection.lng = lng;
        }
        if (!(collection.type === 'guide')) {
          const startMoment = moment(this._collectionService.getCurrentCalendar(collection.calendars).startDate);
          const endMoment = moment(this._collectionService.getCurrentCalendar(collection.calendars).endDate);
          collection.startsIn = moment().to(startMoment);
          collection.startDiff = startMoment.diff(moment());
          collection.endsIn = moment().to(endMoment);
          collection.endDiff = endMoment.diff(moment());
          // Calculate Duration
          let totalLength = 0;
          if (collection.contents) {
            collection.contents.forEach(experienceContent => {
              if (experienceContent.type === 'in-person') {
                const scheduleStartMoment = moment(experienceContent.schedules[0].startTime);
                const scheduleEndMoment = moment(experienceContent.schedules[0].endTime);
                const contentLength = moment.utc(scheduleEndMoment.diff(scheduleStartMoment)).format('HH');
                totalLength += parseInt(contentLength, 10);
              } else if (experienceContent.type === 'video') {

              }
            });
            collection.totalDuration = totalLength.toString();

            // set content count 

            collection.projectCount = this.getContentCount('project', collection);
            collection.inPersonCount = this.getContentCount('in-person', collection);
            collection.onlineCount = this.getContentCount('online', collection);

          }
        }

        // get Content fullname
        collection.typeFullName = this._collectionService.getCollectionContentType(collection.type);

        learningPathContent.courses[0] = collection;
      }
      return learningPathContent;
    });
  }

  private getContentCount(type: string, collection: any) {
    let count = 0;
    for (const content of collection.contents) {
      if (content.type === type) {
        count++;
      }
    }
    return count;
  }

  private getCertificatetemplate() {
    this.loadingCertificate = true;
    if (this.learningPath) {
      this._certificateService.getCertificateTemplate(this.learningPath.id).subscribe((res: any) => {
        console.log('certificate');
        console.log(res);
        if (res !== null && res !== undefined) {
          const formData = JSON.parse(res.formData);
          console.log(formData.groupArray);
          if (formData.groupArray.length > 0) {
            this.certificateHTML = res.certificateHTML;
            this.certificateDomSubscription = this.certificateDomHTML.changes.subscribe(elem => {
              if (elem['first']) {
                const image = elem['first'].nativeElement.children[0].children[0].children[1].children[0];
                image.src = '/assets/images/theblockchainu-qr.png';
              }
            });
          }
        }
        this.loadingCertificate = false;
      });
    }
  }

  /**
	 * saveBookmark
	 */
  saveBookmark(collection: any, index: number) {
    if (this.userId && this.userId.length > 5) {
      if (!collection.bookmarkId) {
        this._collectionService.saveBookmark(collection.id, (err, response) => {
          if (err) {
            console.log(err);
          } else {
            // FB Event Trigger
            try {
              if (fbq && fbq !== undefined) {
                fbq('track', 'AddToWishlist', {
                  currency: 'USD',
                  value: 0.0,
                  content_ids: [collection.id],
                  content_name: collection.title,
                  content_category: collection.type,
                  content_type: 'product'
                });
              }
            } catch (e) {
              console.log(e);
            }
            this.snackBar.open('Bookmarked', 'Close', {
              duration: 5000
            });
            this.learningPath.contents[index].courses[0].bookmarkId = response.id;
          }
        });
      } else {
        this._collectionService.removeBookmark(collection.bookmarkId, (err, response) => {
          if (err) {
            console.log(err);
          } else {
            this.snackBar.open('Removed Bookmark', 'Close', {
              duration: 5000
            });
            this.learningPath.contents[index].courses[0].bookmarkId = null;
          }
        });
      }
    } else {
      // this.dialogsService.openSignup('/experience/' + this.experience.id);
    }
  }

}
