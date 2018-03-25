import { Component, OnInit } from '@angular/core';
declare var moment: any;
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleLearningComponent } from '../console-learning.component';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
import { ProfileService } from '../../../_services/profile/profile.service';

@Component({
    selector: 'app-content-learning-bookmarks',
    templateUrl: './content-learning-bookmarks.component.html',
    styleUrls: ['./content-learning-bookmarks.component.scss', '../../console.component.scss']
})
export class ContentLearningBookmarksComponent implements OnInit {

    public bookmarks: any;
    public loaded: boolean;
    public now: Date;
    private outputResult: any;
    public activeTab: string;
    public userId;

    constructor(
        public activatedRoute: ActivatedRoute,
        public consoleLearningComponent: ConsoleLearningComponent,
        public _profileService: ProfileService,
        public router: Router,
        private _cookieUtilsService: CookieUtilsService,
        private _dialogService: DialogsService,
        public snackBar: MatSnackBar
    ) {
        activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
            if (urlSegment[0] === undefined) {
                consoleLearningComponent.setActiveTab('bookmarks');
            } else {
                console.log(urlSegment[0].path);
                consoleLearningComponent.setActiveTab(urlSegment[0].path);
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.loaded = false;
        this.fetchBookmarks();
    }

    private fetchBookmarks() {
        const query = {
            include: {
                collection: [
                    'topics',
                    'calendars',
                    { contents: ['views', 'schedules', 'submissions'] },
                    { owners: ['profiles', 'reviewsAboutYou', 'ownedCollections'] }
                ]
            }
        };
        this._profileService.getBookmarks(this.userId, query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                this.createOutput(result);
                this.now = new Date();
                this.loaded = true;
            }
        });
    }

    private createOutput(data: any) {
        this.bookmarks = data;
    }

    public deleteBookmark(bookmark: any) {

    }

    public openCollection(collection: any) {
        this.router.navigateByUrl('/' + collection.type + '/' + collection.id + '/calendar/' + collection.calendarId);
    }

    public openProfile(peer: any) {
        this.router.navigate(['profile', peer.id]);
    }

    public viewTransaction(collection: any) {
        this.router.navigate(['console', 'account', 'transactions']);
    }

}
