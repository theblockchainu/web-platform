import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../_services/notification/notification.service';
import { UcWordsPipe } from 'ngx-pipes';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../../../environments/environment';

declare var moment: any;

@Component({
    selector: 'app-console-account-notifications',
    templateUrl: './console-account-notifications.component.html',
    styleUrls: ['./console-account-notifications.component.scss'],
    providers: [UcWordsPipe]
})
export class ConsoleAccountNotificationsComponent implements OnInit {

    public picture_url = false;
    public notifications = [];
    public loaded = false;
    public userId;
    public envVariable;

    constructor(
        public activatedRoute: ActivatedRoute,
        public consoleAccountComponent: ConsoleAccountComponent,
        public _notificationService: NotificationService,
        private ucwords: UcWordsPipe,
        public router: Router,
        private _cookieUtilsService: CookieUtilsService
    ) {
        this.envVariable = environment;
        activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
            if (urlSegment[0] === undefined) {
                consoleAccountComponent.setActiveTab('notifications');
            } else {
                consoleAccountComponent.setActiveTab(urlSegment[0].path);
            }
        });

        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {

        this.loaded = false;
        this._notificationService.getNotifications(this.userId, '{"include": [{"actor":"profiles"}, "collection", {"content": ["packages", "availabilities", "payments"]}], "order": "createdAt DESC" }', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                result.forEach(resultItem => {
                    if (resultItem.actor[0] !== undefined) {
                        this.notifications.push(resultItem);
                    }
                });
                this.loaded = true;
            }
        });
    }

    public getNotificationText(notification) {
		const replacements = {
				'%username%': '<b>' + this.ucwords.transform(notification.actor[0].profiles[0].first_name) + ' '
				+ this.ucwords.transform(notification.actor[0].profiles[0].last_name) + '</b>',
				'%collectionTitle%': (notification.collection !== undefined && notification.collection.length > 0) ?
					this.ucwords.transform(notification.collection[0].title) : '***',
				'%collectionName%': (notification.collection !== undefined && notification.collection.length > 0) ?
					'<b>' + this.ucwords.transform(notification.collection[0].title) + '</b>' : '***',
				'%collectionType%': (notification.collection !== undefined && notification.collection.length > 0) ?
					this.ucwords.transform(notification.collection[0].type) : '***',
				'%sessionDate%': (notification.content !== undefined && notification.content.length > 0) ?
					'<b>' + moment(notification.content[0].availabilities[0].startDateTime).format('Do MMM') + '</b>' : '***',
				'%sessionHours%': (notification.content !== undefined && notification.content.length > 0) ?
					'<b>' + parseInt(notification.content[0].packages[0].duration, 10) / 60 + ' hours</b>' : '***'
			},
            str = notification.description;

        return str.replace(/%\w+%/g, function (all) {
            return replacements[all] || all;
        });
    }

    public getNotificationTime(notification) {
        const createdAt = moment(notification.createdAt);
        return createdAt.fromNow();
    }

    public hideNotification(notification) {
        notification.hidden = true;
        this._notificationService.updateNotification(this.userId, notification, (err, patchResult) => {
            if (err) {
                console.log(err);
                notification.hidden = false;
            }
        });
    }

    public onNotificationClick(notification) {
        this.router.navigate(notification.actionUrl);
    }

}
