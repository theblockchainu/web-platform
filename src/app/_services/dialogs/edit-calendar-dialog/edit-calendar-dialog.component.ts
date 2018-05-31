import { MatDialogRef, MatDialog, MatDialogConfig, MatIconModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import {
    FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators
} from '@angular/forms';

import { ContentService } from '../../../_services/content/content.service';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ViewConflictDialogComponent } from '../view-conflict-dialog/view-conflict-dialog.component';
import { SelectDateDialogComponent } from '../select-date-dialog/select-date-dialog.component';
import {
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours
} from 'date-fns';
import { Subject } from 'rxjs/Subject';
import {
    CalendarEvent,
    CalendarEventAction,
    CalendarEventTimesChangedEvent,
    CalendarDateFormatter
} from 'angular-calendar';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { Router } from '@angular/router';
const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    }
};

@Component({
    selector: 'app-edit-calendar-dialog',
    templateUrl: './edit-calendar-dialog.component.html',
    styleUrls: ['./edit-calendar-dialog.component.scss'],
    providers: [
        {
            provide: CalendarDateFormatter,
            useClass: CustomDateFormatter
        }
    ]
})
export class EditCalendarDialogComponent implements OnInit {

    public collection;
    public contents;
    public calendars = [];
    public participants;
    public inpEvents: CalendarEvent[];
    public userId;
    public startDate;
    public endDate;
    public duration;

    public selectedIndex;
    public cohortDeleted = false;
    public acceptConflicts = false;

    public daysOption;
    public weekDayOption = [
        { value: 1, text: 'Monday' },
        { value: 2, text: 'Tuesday' },
        { value: 3, text: 'Wednesday' },
        { value: 4, text: 'Thursday' },
        { value: 5, text: 'Friday' },
        { value: 6, text: 'Saturday' },
        { value: 7, text: 'Sunday' }
    ];
    public monthOption;
    public dateRepeat;

    public recurring: FormGroup;

    public recurringCalendar;

    public minDate: Date;

    // Insights stats
    public startDay;
    public endDay;
    public recurringCount = 0;
    public totalRunningDays = 0;
    public nextDays;
    public weekDaysStartGap = 0;

    // eventCalendar
    public eventCalendar = [];
    public results;
    public computedConflict = [];
    public removedEvents = [];
    public computedEventCalendar = [];

    // Calendar Start
    public dateClicked = false;
    public clickedDate;
    public eventsForTheDay = {};
    objectKeys = Object.keys;
    public view = 'month';

    public viewDate: Date = new Date();

    refresh: Subject<any> = new Subject();

    public modalData: {
        action: string;
        event: CalendarEvent;
    };

    public allItenaries = [];
    public itenariesObj = {};

    events: CalendarEvent[] = [
    ];

    activeDayIsOpen = true;
    private clickedCohort: any;
    private clickedCohortId: any;
    private clickedCohortStartDate: Date;
    private clickedCohortEndDate: Date;

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        this.eventsForTheDay = {};
        if (events.length === 0) {
            this.dateClicked = false;
            return;
        } else {
            this.dateClicked = true; // !this.dateClicked;
        }
        this.clickedDate = date;
        this.clickedCohort = this.parseTitle(events[0].title)[0];
        this.clickedCohortId = this.parseTitle(events[0].title)[1];
        this.clickedCohortStartDate = events[0].start;
        this.clickedCohortEndDate = events[0].end;
        for (const event of events) {
            const titleCalIdArray = this.parseTitle(event.title);
            const calId = titleCalIdArray[1];
            const title = titleCalIdArray[0];
            const type = titleCalIdArray[2];
            const eventId = titleCalIdArray[3];
            if (type !== 'cohort') {
                if (!this.eventsForTheDay.hasOwnProperty(calId)) {
                    this.eventsForTheDay[calId] = [{
                        id: eventId,
                        title: title,
                        color: event.color,
                        start: event.start,
                        end: event.end
                    }];
                } else {
                    this.eventsForTheDay[calId].push({
                        id: eventId,
                        title: title,
                        color: event.color,
                        start: event.start,
                        end: event.end
                    });
                }
            }
        }
        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    }

    // Calendar Ends

    /**
     * Get array of days
     * @returns {Array}
     */
    public getDaysArray() {
        const days = [];
        for (let i = 1; i <= 30; i++) {
            days.push(i);
        }
        return days;
    }

    /**
     * Get array of months
     * @returns {Array}
     */
    public getMonthArray() {
        const months = [];
        for (let i = 1; i <= 15; i++) {
            months.push(i);
        }
        return months;
    }

    public parseTitle(title) {
        return title.split(':');
    }

    constructor(public dialogRef: MatDialogRef<EditCalendarDialogComponent>,
        private _fb: FormBuilder,
        private _contentService: ContentService,
        private dialog: MatDialog,
        private router: Router,
        private _collectionService: CollectionService,
        private _cookieUtilsService: CookieUtilsService
    ) {

        this.userId = _cookieUtilsService.getValue('userId');

    }
    public ngOnInit() {
        this.duration = Math.round(moment.duration(moment(this.endDate, 'YYYY-MM-DD HH:mm:ss').diff(moment(this.startDate, 'YYYY-MM-DD HH:mm:ss'))).asDays()) + 1;
        this.daysOption = this.getDaysArray();
        this.events = this.inpEvents;
        this.monthOption = this.getMonthArray();
        this.minDate = moment(this.endDate).add(1, 'days').toDate();
        // Get all the events for a user
        this._contentService.getEvents(this.userId)
            .subscribe((response) => {
                this.eventCalendar = [];
                this.eventCalendar = response;
                console.log(this.eventCalendar);
            });
        this.recurring = this._fb.group({
            repeatWorkshopGroupOption: ['', Validators.required],
            days: [2],
            weekdays: [1],
            daysRepeat: [2],
            monthsRepeat: [6],
            repeatTillOption: ['', Validators.required],
            dateRepeat: [moment(this.endDate).add(1, 'M').toDate()]
        });
    }

    public saveCalendar(): void {

        this.recurringCalendar = _.remove(this.recurringCalendar, (item) => {
            return item.markedForDelete !== true;
        });
        this.recurringCalendar.map(function (item) {
            delete item.content;
            return item;
        });
        console.log(this.recurringCalendar);

        // Hack to handle backend not storing date in UTC and http always sending in UTC
        const tempCalendar = _.cloneDeep(this.recurringCalendar);
        tempCalendar.forEach(element => {
            element.startDate = moment(element.startDate).format('YYYY-MM-DD').toString();
            element.endDate = moment(element.endDate).format('YYYY-MM-DD').toString();
        });
        this._collectionService.postCalendars(this.collection.id, tempCalendar)
            .subscribe((response) => {
                this.dialogRef.close({
                    calendarsSaved: 'calendarsSaved',
                    cohortDeleted: this.cohortDeleted
                });
            });
        console.log(this.recurringCalendar);
    }

    public computeWeekday(value) {
        this.repeatFrequency('weekdays');
    }

    public computeDays(value) {
        this.repeatFrequency('days');
    }

    public repeatTillTrigger() {
        this.repeatTill(this.recurring.value.repeatTillOption);
    }

    public repeatFrequency(value) {
        this.computedEventCalendar = [];
        switch (value) {
            case 'immediate':
                // this.startDay = this.endDate;
                this.startDay = moment(this.endDate).add(1, 'days').format('YYYY-MM-DD');
                break;
            case 'days':
                this.startDay = moment(this.endDate).add(this.recurring.controls['days'].value + 1, 'days').format('YYYY-MM-DD');
                break;
            case 'weekdays':
                const isoWeekDay = this.recurring.controls['weekdays'].value;
                const isoWeekDayForLastDate = moment(this.endDate).isoWeekday();
                if (isoWeekDayForLastDate < isoWeekDay) {
                    // then just give me this week's instance of that day
                    this.startDay = moment(this.endDate).isoWeekday(isoWeekDay);
                    // this.startDay =  moment(this.endDate).add(isoWeekDay - isoWeekDayForLastDate, 'days');
                } else if (isoWeekDayForLastDate > isoWeekDay) {
                    // otherwise, give me next week's instance of that day
                    // this.startDay = moment(this.endDate).add(7 - isoWeekDayForLastDate + 1, 'days');//.isoWeekday(isoWeekDay)
                    if (isoWeekDayForLastDate + isoWeekDay >= 7) {
                        this.startDay = moment(this.endDate).add(1, 'weeks').subtract(isoWeekDayForLastDate - isoWeekDay, 'days');
                    } else {
                        this.startDay = moment(this.endDate).add(7 - isoWeekDayForLastDate + 1, 'days');
                        // .isoWeekday(isoWeekDay)
                    }
                } else if (isoWeekDayForLastDate === isoWeekDay) {
                    this.startDay = moment(this.endDate).add(1, 'weeks').isoWeekday(isoWeekDay);
                }
                this.weekDaysStartGap = 7 - isoWeekDayForLastDate;
                break;
            default:
                this.startDay = this.startDate;

        }
        this.repeatTill(this.recurring.value.repeatTillOption);
    }

    public repeatTill(value) {
        this.computedEventCalendar = [];
        const days = +this.recurring.controls['days'].value;
        const weekday = this.recurring.controls['weekdays'].value;
        const tillDate = this.recurring.controls['dateRepeat'].value;
        if (tillDate < this.startDate) {
            return;
        }
        const start = this.startDay;
        const end = moment(this.startDay).add(this.duration - 1, 'days');
        switch (value) {
            case 'daysRepeat':
                this.recurringCalendar = [];
                const freq = this.recurring.controls['daysRepeat'].value;
                // this.recurringCalendar.push({ startDate: moment(start).utcOffset(0).toDate().toISOString(), endDate: end.utcOffset(0).set({hour:18,minute:29,second:59}).toDate().toISOString()});
                this.recurringCalendar.push({ startDate: moment(start).toDate(), endDate: end.toDate(), markedForDelete: false });
                this.totalRunningDays = this.duration;
                this.endDay = end;
                for (let i = 1; i < freq; i++) {
                    this.createCalendars(this.endDay, days, weekday);
                }
                break;
            case 'monthsRepeat':
                this.recurringCalendar = [];
                const months = this.recurring.controls['monthsRepeat'].value;
                const futureMonth = moment(start).add(months, 'M');
                const futureMonthEnd = moment(futureMonth).endOf('month');
                // this.recurringCalendar.push({ startDate: moment(start).utcOffset(0).toDate().toISOString(), endDate: end.utcOffset(0).set({hour:18,minute:29,second:59}).toDate().toISOString()});
                this.recurringCalendar.push({ startDate: moment(start).toDate(), endDate: end.toDate(), markedForDelete: false });
                this.endDay = end;
                this.totalRunningDays = this.duration;
                while (moment(this.endDay).isBefore(moment(futureMonth))) {
                    this.createCalendars(this.endDay, days, weekday);
                }
                break;
            case 'dateRepeat':
                this.recurringCalendar = [];
                // this.recurringCalendar.push({ startDate: moment(start).utcOffset(0).toDate().toISOString(), endDate: end.utcOffset(0).set({hour:18,minute:29,second:59}).toDate().toISOString()});
                this.recurringCalendar.push({ startDate: moment(start).toDate(), endDate: end.toDate(), markedForDelete: false });
                this.endDay = end;
                this.totalRunningDays = this.duration;
                while (moment(this.endDay).isBefore(moment(tillDate))) {
                    this.createCalendars(this.endDay, days, weekday);
                }
                break;
            default:
                this.recurringCalendar = [];
        }
        if (this.endDay) {
            this.nextDays = moment(this.endDay).diff(moment(this.endDate), 'days');
            // Generate a detail list of proposed collection
            if (this.recurringCalendar.length > 0) {
                const length = this.contents.length;
                this.recurringCalendar.forEach(calendar => {
                    const calendarItenary = [];
                    let itenary = {};
                    let tempStartDay;
                    for (const content of this.contents) {
                        if (tempStartDay) {
                            if (tempStartDay !== content.schedules[0].startDay) {
                                calendarItenary.push(itenary);
                                itenary = {};
                            }
                        } else {
                            tempStartDay = content.schedules[0].startDay;
                        }
                        const eventDate = this.calculateDate(calendar.startDate, content.schedules[0].startDay);
                        if (itenary && itenary['startDay'] === content.schedules[0].startDay) {
                            itenary['contents'].push(content);
                        } else {
                            itenary = {
                                startDay: content.schedules[0].startDay,
                                startDate: eventDate,
                                contents: [content]
                            };

                        }
                    }
                    calendar['content'] = calendarItenary;
                });
            }
            console.log(this.recurringCalendar);
            const temEventCalendar = _.cloneDeep(this.eventCalendar);
            this.computedEventCalendar = _.remove(temEventCalendar, entry => {
                return ((moment(this.endDate) < moment(entry.startDateTime) && moment(entry.endDateTime) < this.endDay)
                    || (moment(this.endDate) > moment(entry.startDateTime) && moment(this.endDate) < moment(entry.endDateTime) && moment(entry.endDateTime) < this.endDay)
                    || (moment(this.endDate) > moment(entry.startDateTime) && moment(entry.endDateTime) > this.endDay))
                    && entry.collectionId !== this.collection.id
                    // Hack to handle the existing Calendar in eventCalendar when Cohort is deleted
                    && entry.contentType === 'online';
            }, this);
            console.log(temEventCalendar);
            console.log(this.computedEventCalendar);
            if (this.recurringCalendar.length > 0) {
                // Modify recurringCalendar and contents to look same like eventCalendar
                for (const calendar of this.recurringCalendar) {
                    const startDate = moment(calendar.startDate).local().format('YYYY-MM-DD');
                    const endDate = moment(calendar.endDate).local().format('YYYY-MM-DD');
                    for (const content of this.contents) {
                        if (content.type === 'online') {
                            const contentStartDate = moment(startDate).add(content.schedules[0].startDay, 'days');
                            const contentEndDate = moment(contentStartDate).add(content.schedules[0].endDay, 'days');
                            this.computedEventCalendar.push(
                                {
                                    collectionId: this.collection.id,
                                    collectionName: this.collection.name,
                                    collectionType: this.collection.type,
                                    contentId: content.id,
                                    contentName: content.title,
                                    contentType: content.type,
                                    endDateTime: moment(moment(contentEndDate).format('YYYY-MM-DD') + ' ' + this.extractTime(content.schedules[0].endTime)).toDate(),
                                    startDateTime: moment(moment(contentStartDate).format('YYYY-MM-DD') + ' ' + this.extractTime(content.schedules[0].startTime)).toDate()
                                }
                            );
                        }
                    }
                }

                this.sort();
                this.results = [];
                this.results = _.cloneDeep(this.overlap());
                // Remove other conflicts
                this.removedEvents = _.remove(this.results.ranges, (item) => {
                    return moment(item.current.endDateTime, 'YYYY-MM-DD') < moment(this.recurringCalendar[0].startDate, 'YYYY-MM-DD');
                });
                this.computedConflict = [];
                for (const conflict of this.results.ranges) {
                    if (conflict.previous.collectionId === this.collection.id) {
                        this.computedConflict.push({
                            event: conflict.previous,
                            conflictWith: conflict.current,
                            markedForDelete: false
                        });
                    } else {
                        this.computedConflict.push({
                            event: conflict.current,
                            conflictWith: conflict.previous,
                            markedForDelete: false
                        });
                    }
                }
                let newArr = [];
                newArr = _.filter(this.computedConflict, (element, index) => {
                    // tests if the element has a duplicate in the rest of the array
                    for (index += 1; index < this.computedConflict.length; index += 1) {
                        if (_.isEqual(element, this.computedConflict[index])) {
                            return false;
                        }
                    }
                    return true;
                });
                this.computedConflict = [];
                this.computedConflict = _.cloneDeep(newArr);
            }
            this.recurringCount = this.recurringCalendar.length;
        }
    }

    public calculateDate(fromdate, day) {
        const tempMoment = moment(fromdate);
        tempMoment.add(day, 'days');
        return tempMoment;
    }

    private extractDate(dateString: string) {
        return moment.utc(dateString).local().toDate();
    }

    private extractTime(dateString: string) {
        const time = moment.utc(dateString).local().format('HH:mm:ss');
        return time;
    }

    public createCalendars(end, days, weekday) {
        let start = end;
        let tempEnd;
        if (this.recurring.value.repeatWorkshopGroupOption === 'immediate') {
            // start = moment(start).utcOffset(0).set({hour:18,minute:30,second:0});
            start = moment(start).add(1, 'days');
            // tempEnd = moment(start).add(this.duration, 'days').utcOffset(0).set({hour:18,minute:29,second:59});
            tempEnd = moment(start).add(this.duration - 1, 'days');
            this.recurringCalendar.push({ startDate: start.toDate(), endDate: tempEnd.toDate(), markedForDelete: false });
            end = tempEnd; // .format('YYYY-MM-DD');
        } else if (this.recurring.value.repeatWorkshopGroupOption === 'days') {
            // start = moment(start).add(days, 'days').utcOffset(0).set({hour:18,minute:30,second:0});
            // tempEnd = moment(start).add(this.duration, 'days').utcOffset(0).set({hour:18,minute:29,second:59});
            start = moment(start).add(days + 1, 'days');
            tempEnd = moment(start).add(this.duration - 1, 'days');
            this.recurringCalendar.push({ startDate: start.toDate(), endDate: tempEnd.toDate(), markedForDelete: false });
            end = tempEnd; // .format('YYYY-MM-DD');
        } else if (this.recurring.value.repeatWorkshopGroupOption === 'weekdays') {
            const isoWeekDayForLastDate = moment(end).isoWeekday();
            if (isoWeekDayForLastDate < weekday) {
                // then just give me this week's instance of that day
                start = moment(end).isoWeekday(weekday);
                // start =  moment(end).add(weekday - isoWeekDayForLastDate, 'days');//
            } else if (isoWeekDayForLastDate > weekday) {
                // otherwise, give me next week's instance of that day
                if (isoWeekDayForLastDate + weekday >= 7) {
                    start = moment(end).add(1, 'weeks').subtract(isoWeekDayForLastDate - weekday, 'days');
                } else {
                    start = moment(end).add(7 - isoWeekDayForLastDate + 1, 'days'); // .isoWeekday(isoWeekDay)
                }
            } else if (isoWeekDayForLastDate === weekday) {
                start = moment(end).add(1, 'weeks').isoWeekday(weekday);
            }
            // start = moment(start).subtract(1, 'days').utcOffset(0).set({hour:18,minute:30,second:0});
            // tempEnd = moment(start).add(this.duration, 'days').utcOffset(0).set({hour:18,minute:29,second:59});
            // start = moment(start).subtract(1, 'days');
            tempEnd = moment(start).add(this.duration - 1, 'days');
            this.recurringCalendar.push({ startDate: start.toDate(), endDate: tempEnd.toDate(), markedForDelete: false });
            end = tempEnd; // .format('YYYY-MM-DD');
        }
        this.totalRunningDays += this.duration;
        this.endDay = end;
    }

    public sort() {
        const sortedRanges = this.computedEventCalendar.sort((previous, current) => {
            // get the start date from previous and current
            const previousTime = moment(previous.startDateTime).toDate().getTime();
            const currentTime = moment(current.startDateTime).toDate().getTime();
            // if the previous is earlier than the current
            if (previousTime < currentTime) {
                return -1;
            }
            // if the previous time is the same as the current time
            if (previousTime === currentTime) {
                return 0;
            }
            // if the previous time is later than the current time
            return 1;
        });
        this.computedEventCalendar = [];
        this.computedEventCalendar = _.cloneDeep(sortedRanges);
    }

    public overlap() {
        const result = this.computedEventCalendar.reduce((res, current, idx, arr) => {
            // get the previous range
            if (idx === 0) { return res; }
            const previous = arr[idx - 1];
            // check for any overlap
            const previousEnd = moment(previous.endDateTime).toDate().getTime();
            const currentStart = moment(current.startDateTime).toDate().getTime();
            const overlap = (previousEnd >= currentStart);
            // store the res
            if (overlap) {
                // yes, there is overlap
                res.overlap = true;
                // store the specific ranges that overlap
                res.ranges.push({
                    previous: previous,
                    current: current
                });
            }
            return res;
            // seed the reduce
        }, { overlap: false, ranges: [] });

        console.log(result);
        // return the final results
        return result;
    }

    // Modal
    public viewConflict() {
        const dialogRef = this.dialog.open(ViewConflictDialogComponent, {
            width: '50vw',
            height: '90vh',
            panelClass: 'responsive-dialog',
            data: {
                conflicts: this.computedConflict,
                id: this.collection.id
            }
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result !== undefined) {
                console.log(result);
                result.forEach(conflicts => {
                    this.recurringCalendar.forEach(item => {
                        if (moment(conflicts.event.startDateTime).format('YYYY-MM-DD') >= moment(item.startDate).format('YYYY-MM-DD')
                            && moment(conflicts.event.endDateTime).format('YYYY-MM-DD') <= moment(item.endDate).format('YYYY-MM-DD')) {
                            item.markedForDelete = conflicts.markedForDelete;
                        }
                    });
                });
                console.log(this.recurringCalendar);
            }
            this.acceptConflicts = true;
        });
    }

    /**
     * viewCohorts
     */
    public viewCohorts() {
        this.dialog.open(SelectDateDialogComponent, {
            width: '70vw',
            height: '90vh',
            panelClass: 'responsive-dialog',
            data: { itineraries: this.allItenaries, mode: 'editDelete', participants: this.participants, userType: 'teacher', collectionType: this.collection.type }
        }).afterClosed()
            .subscribe((data) => {
                // Handle the deleted calendar if any
                if (data && data.length > 0) {
                    data.forEach(calendar => {
                        this._collectionService.deleteCalendar(calendar).subscribe();
                        this.allItenaries = _.remove(this.allItenaries, (item) => {
                            return item.calendar.id !== calendar;
                        });
                        this.calendars = _.remove(this.calendars, (item) => {
                            return item.id !== calendar;
                        });
                        this.events = _.remove(this.events, (item) => {
                            return !item.title.includes(':' + calendar + ':');
                        });
                    });
                    // As sorting is taken care of no need to sort now
                    this.endDate = this.allItenaries[this.allItenaries.length - 1].calendar.endDate;
                }
                this.cohortDeleted = true;
            });
    }

    onTabOpen(event) {
        this.selectedIndex = event.index;
    }

    onTabClose(event) {
        this.selectedIndex = -1;
    }

    addDeleteEvents() {
        this.dialogRef.close({
            calendarsSaved: 'calendarsSaved',
            cohortDeleted: this.cohortDeleted
        });
    }
}
