import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { environment } from '../../../environments/environment';
import { map, flatMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
@Injectable()
export class ContentService {

	public envVariable;

	constructor(private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private requestHeaderService: RequestHeaderService) {
		this.envVariable = environment;
	}

	public getEvents(userId: string) {
		return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/eventCalendar', this.requestHeaderService.options);

	}

	public addNewLanguage(name: string) {
		const body = {
			'name': name,
			'code': name
		};
		return this.http.post(environment.apiUrl + '/api/languages', body, this.requestHeaderService.options);
	}

	public getMediaObject(urlString: string) {
		const query = {
			'where':
			{
				url: urlString
			}
		};
		return this.http.get(environment.apiUrl + '/api/media?filter=' + JSON.stringify(query), this.requestHeaderService.options);
	}

	public deleteRSVP(rsvpId) {
		return this.http
			.delete(environment.apiUrl + '/api/rsvps/' + rsvpId, this.requestHeaderService.options);
	}

	public createRSVP(contentId, calendarId) {
		const body = {
			'contentId': contentId,
			'calendarId': calendarId
		};
		return this.http
			.post(environment.apiUrl + '/api/contents/' + contentId + '/rsvps', body, this.requestHeaderService.options);
	}

	public deleteContent(contentId) {
		return this.http.delete(environment.apiUrl + '/api/contents/' + contentId, this.requestHeaderService.options);
	}

	public patchContent(contentId, contentbody) {
		return this.http.patch(environment.apiUrl + '/api/contents/' + contentId, contentbody, this.requestHeaderService.options);
	}

	public patchMatchingContents(indexedArray) {
		const patchArray = [];
		indexedArray.forEach(content => {
			patchArray.push(
				this.patchContent(content.id, content)
			);
		});
		return forkJoin(patchArray);
	}

	public linkContentToCollection(contentId: string, collectionId: string) {
		return this.http
			.get(environment.apiUrl + '/api/contents/' + contentId +
				'/courses', this.requestHeaderService.options)
			.pipe(
				flatMap((res: any) => {
					const delinkRequestArray = [];
					if (res.length > 0) {
						console.log(res);
						res.forEach(course => {
							delinkRequestArray.push(
								this.http.delete(environment.apiUrl + '/api/contents/' + contentId +
									'/courses/rel/' + course.id, this.requestHeaderService.options)
							);
						});
						return forkJoin(delinkRequestArray);
					} else {
						console.log('delinked');
						return new Observable(observer => {
							observer.next();
						});
					}
				}), flatMap(res => {
					return this.http
						.put(environment.apiUrl + '/api/contents/' + contentId +
							'/courses/rel/' + collectionId, {}, this.requestHeaderService.options);
				})
			);

	}

	public getContents(query: any) {
		return this.http.get(environment.apiUrl + '/api/contents?filter=' + JSON.stringify(query), this.requestHeaderService.options);
	}

	public linkPayment(contentId: string, paymentId: string) {
		return this.http.put(environment.apiUrl + '/api/contents/' + contentId + '/payments/rel/' + paymentId, {}, this.requestHeaderService.options);
	}
}
