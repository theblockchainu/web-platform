import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class CorestackService {

	constructor(
		private httpClient: HttpClient,
		private requestHeaderService: RequestHeaderService
	) { }

	public getAccessDetails(studentId: string, courseId: string) {
		return this.httpClient.get(environment.apiUrl + '/api/corestack_students/' + studentId + '/course/' + courseId + '/access_details', this.requestHeaderService.options);
	}

	public startInstance(studentId: string, courseId: string) {
		const body = {
			student_id: studentId,
			course_id: courseId
		};
		return this.httpClient.post(environment.apiUrl + '/api/corestack_students/start_instance', body, this.requestHeaderService.options);
	}

	public stopInstance(studentId: string, courseId: string) {
		const body = {
			student_id: studentId,
			course_id: courseId
		};
		return this.httpClient.post(environment.apiUrl + '/api/corestack_students/stop_instance', body, this.requestHeaderService.options);
	}

	public restartInstance(studentId: string, courseId: string) {
		const body = {
			student_id: studentId,
			course_id: courseId
		};
		return this.httpClient.post(environment.apiUrl + '/api/corestack_students/restart_instance', body, this.requestHeaderService.options);
	}

}
