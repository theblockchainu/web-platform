import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import {environment} from '../../../environments/environment';
@Injectable()
export class SocketService {

    private socket;
    public userId;
    public envVariable;

    constructor(
        private _cookieUtilsService: CookieUtilsService
    ) {
        this.envVariable = environment;
        this.userId = _cookieUtilsService.getValue('userId');
        this.socket = io(environment.apiUrl);
        this.addUser(this.userId);
        this.listenForNewMessage().subscribe(message => {
            console.log(message);
        });
        this.listenForCookieUpdate().subscribe(message => {
            console.log('cookie updated: ' + message );
            if (message.hasOwnProperty('accountApproved')) {
                _cookieUtilsService.setValue('accountApproved', message['accountApproved']);
            }
        });
    }

    public addUser(userId) {
        if (userId !== undefined) {
            const user = {
                id: userId
            };
            this.socket.emit('addUser', user);
        }
    }

    public sendMessage(message) {
        this.socket.emit('message', message);
    }

    public sendStartView(view) {
        this.socket.emit('startView', view);
    }

    public sendEndView(view) {
        this.socket.emit('endView', view);
    }


    // LISTENERS
    public listenForViewStarted() {
        return new Observable(observer => {
            this.socket.on('startedView', (data) => {
               observer.next(data);
            });
            return;
        });
    }

    public listenForViewEnded() {
        return new Observable(observer => {
            this.socket.on('endedView', (data) => {
                observer.next(data);
            });
            return;
        });
    }

    public listenForNewMessage() {
        return new Observable(observer => {
            this.socket.on('message', (data) => {
                observer.next(data);
            });
            return;
        });
    }

    public listenForCookieUpdate() {
        return new Observable(observer => {
            this.socket.on('cookie', (data) => {
                observer.next(data);
            });
            return;
        });
    }

    public joinRoom(roomId) {
        this.socket.emit('joinRoom', roomId);
    }

}
