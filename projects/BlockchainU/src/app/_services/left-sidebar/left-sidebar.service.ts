import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import { RequestHeaderService } from '../requestHeader/request-header.service';

export class SideBarMenuItem {
    active: boolean;
    title: string;
    step: string;
    icon?: string;
    submenu: {};
}

@Injectable()
export class LeftSidebarService {

    sidebarMenuItems: Observable<SideBarMenuItem>;
    constructor(
        private http: HttpClient,
        public router: Router,
        private requestHeaderService: RequestHeaderService
    ) {
    }

    public getMenuItems(fileLocation: string): Observable<any> {
        return this.http.get(fileLocation, this.requestHeaderService.options);
    }

    public updateSideMenu(collection, sidebarMenuItems) {
        console.log(collection);
        console.log(sidebarMenuItems);
        let completedSections = 0;
        if (collection.status === 'draft') {
            if (sidebarMenuItems[4].visible) {
                sidebarMenuItems[4].visible = false;
            }
            if (sidebarMenuItems[3].visible) {
                sidebarMenuItems[3].visible = true;
            }
        } else if (collection.status === 'submitted') {
            if (sidebarMenuItems[4].visible) {
                sidebarMenuItems[4].visible = false;
            }
            if (sidebarMenuItems[3]) {
                sidebarMenuItems[3].visible = true;
            }
            // sidebarMenuItems.forEach(mainItem => {
            //     if (mainItem.submenu !== undefined && mainItem.title !== 'Finishing Touches') {
            //         mainItem.submenu.forEach(item => {
            //             item.locked = true;
            //         }, this);
            //     }
            // });
        } else {
            if (sidebarMenuItems[4].visible) {
                sidebarMenuItems[4].visible = true;
            } if (sidebarMenuItems[4].submenu[0]) {
                sidebarMenuItems[4].submenu[1].visible = true;
            }
            if (sidebarMenuItems[4].submenu[1] && sidebarMenuItems[4].submenu[1].visible) {
                sidebarMenuItems[4].submenu[1].visible = true;

            }
            if (sidebarMenuItems[3] && sidebarMenuItems[3].visible) {
                sidebarMenuItems[3].visible = false;
            }
        }
        if (collection.subCategory && collection.subCategory.length > 0) {
            sidebarMenuItems[0].submenu[0].complete = true;
            completedSections++;
        }
        if (collection.topics !== undefined && collection.topics.length > 0) {
            sidebarMenuItems[0].submenu[1].complete = true;
            completedSections++;
        }
        if (collection.language !== undefined && collection.language.length > 0) {
            sidebarMenuItems[0].submenu[2].complete = true;
            completedSections++;
        }
        if (collection.aboutHost !== undefined && collection.aboutHost.length > 0) {
            sidebarMenuItems[0].submenu[3].complete = true;
            completedSections++;
        }
        if (collection.title !== undefined && collection.headline !== undefined &&
            collection.title.length > 0 && collection.headline.length > 0) {
            sidebarMenuItems[1].submenu[0].complete = true;
            completedSections++;
        }
        if (collection.description !== undefined && collection.description.length > 0) {
            sidebarMenuItems[1].submenu[1].complete = true;
            completedSections++;
        }
        if (collection.difficultyLevel !== undefined && collection.notes !== undefined &&
            collection.difficultyLevel.length > 0 && collection.notes.length > 0) {
            sidebarMenuItems[1].submenu[2].complete = true;
            completedSections++;
        }
        if (collection.maxSpots !== undefined && collection.maxSpots.length > 0) {
            sidebarMenuItems[1].submenu[3].complete = true;
            completedSections++;
        }
        if ((collection.imageUrls && collection.imageUrls.length > 0)
            || (collection.videoUrls && collection.videoUrls.length > 0)) {
            sidebarMenuItems[1].submenu[4].complete = true;
            completedSections++;
        } else {
            sidebarMenuItems[1].submenu[4].complete = false;
        }
        if (collection.price !== undefined && collection.currency && collection.cancellationPolicy && collection.academicGyan !== undefined && collection.nonAcademicGyan !== undefined) {
            sidebarMenuItems[1].submenu[7].complete = true;
            completedSections++;
        }
        if (collection.assessment_models && collection.assessment_models[0] && collection.assessment_models[0].assessment_rules && collection.assessment_models[0].assessment_na_rules) {
            sidebarMenuItems[1].submenu[6].complete = true;
            completedSections++;
        }
        if (collection.contents !== undefined && collection.contents.length > 0) {
            sidebarMenuItems[2].submenu.forEach(item => {
                item.complete = true;
            });
            completedSections++;
        }
        sidebarMenuItems[3].locked = completedSections !== 11;
        if (collection.owners !== undefined && collection.owners[0].phoneVerified) {
            sidebarMenuItems[4].submenu[0].complete = true;
        }
        return sidebarMenuItems;
    }

    public updateSideMenuCertificate(certificate: any, sidebarMenuItems, menuIndex?: number, subMenuIndex?: number) {
        if (menuIndex && subMenuIndex) {
            sidebarMenuItems[menuIndex].submenu[subMenuIndex].complete = true;
        } else if (certificate && certificate.formData && certificate.formData.length > 0 && certificate.expiryDate && certificate.expiryDate.length > 0) {
            sidebarMenuItems[1].submenu[5].complete = true;
        }
        return sidebarMenuItems;
    }

    public updateSessionMenu(sidebarMenuItems, dataToUpdate: SessionConfigObject) {
        let completedSections = 0;
        if (dataToUpdate.profileObject) {
            if (dataToUpdate.profileObject.headline && dataToUpdate.profileObject.headline.length > 0 && dataToUpdate.profileObject.description && dataToUpdate.profileObject.description.length > 0) {
                sidebarMenuItems[0].submenu[0].complete = true;
                completedSections++;
            }

            if (dataToUpdate.profileObject.picture_url) {
                sidebarMenuItems[0].submenu[1].complete = true;
                completedSections++;
            }

            if (dataToUpdate.profileObject.location_lat && dataToUpdate.profileObject.other_languages
                && dataToUpdate.profileObject.other_languages.length > 0) {
                sidebarMenuItems[0].submenu[2].complete = true;
                completedSections++;
            }
        }

        if (dataToUpdate.educationObject && dataToUpdate.educationObject.length > 0) {
            sidebarMenuItems[0].submenu[3].complete = true;
        }

        if (dataToUpdate.topicsObject) {
            sidebarMenuItems[1].submenu[0].complete = true;
            sidebarMenuItems[1].submenu[1].complete = true;
        }

        if (dataToUpdate.provisionObject && dataToUpdate.provisionObject.length > 0) {
            sidebarMenuItems[1].submenu[2].complete = true;
        }

        if (dataToUpdate.availabilityObject && dataToUpdate.availabilityObject.length > 0) {
            sidebarMenuItems[1].submenu[3].complete = true;
        }

        if (dataToUpdate.priceObject && dataToUpdate.priceObject.length > 0) {
            sidebarMenuItems[1].submenu[4].complete = true;
        }

        if (dataToUpdate.preferenceObject) {
            if (dataToUpdate.preferenceObject.bookingProcess) {
                sidebarMenuItems[2].submenu[0].complete = true;
            }
            if (dataToUpdate.preferenceObject.customUrl) {
                sidebarMenuItems[2].submenu[1].complete = true;
            }
        }
        return sidebarMenuItems;
    }

    public updateBountySideMenu(collection, sidebarMenuItems) {
        console.log(collection);
        console.log(sidebarMenuItems);
        let completedSections = 0;
        if (collection.status === 'draft') {
            if (sidebarMenuItems[4].visible) {
                sidebarMenuItems[4].visible = false;
            }
            if (sidebarMenuItems[3].visible) {
                sidebarMenuItems[3].visible = true;
            }
        } else if (collection.status === 'submitted') {
            if (sidebarMenuItems[4].visible) {
                sidebarMenuItems[4].visible = false;
            }
            if (sidebarMenuItems[3]) {
                sidebarMenuItems[3].visible = true;
            }
            // sidebarMenuItems.forEach(mainItem => {
            //     if (mainItem.submenu !== undefined && mainItem.title !== 'Finishing Touches') {
            //         mainItem.submenu.forEach(item => {
            //             item.locked = true;
            //         }, this);
            //     }
            // });
        } else {
            if (sidebarMenuItems[4].visible) {
                sidebarMenuItems[4].visible = true;
            } if (sidebarMenuItems[4].submenu[0]) {
                sidebarMenuItems[4].submenu[1].visible = true;
            }
            if (sidebarMenuItems[4].submenu[1] && sidebarMenuItems[4].submenu[1].visible) {
                sidebarMenuItems[4].submenu[1].visible = true;

            }
            if (sidebarMenuItems[3] && sidebarMenuItems[3].visible) {
                sidebarMenuItems[3].visible = false;
            }
        }
        if (collection.subCategory && collection.subCategory.length > 0) {
            sidebarMenuItems[0].submenu[0].complete = true;
            completedSections++;
        }
        if (collection.topics !== undefined && collection.topics.length > 0) {
            sidebarMenuItems[0].submenu[1].complete = true;
            completedSections++;
        }
        // if (collection.language !== undefined && collection.language.length > 0) {
        //     sidebarMenuItems[0].submenu[2].complete = true;
        //     completedSections++;
        // }
        if (collection.aboutHost !== undefined && collection.aboutHost.length > 0) {
            sidebarMenuItems[0].submenu[2].complete = true;
            completedSections++;
        }
        if (collection.title !== undefined && collection.headline !== undefined &&
            collection.title.length > 0 && collection.headline.length > 0) {
            sidebarMenuItems[1].submenu[0].complete = true;
            completedSections++;
        }
        if (collection.description !== undefined && collection.description.length > 0) {
            sidebarMenuItems[1].submenu[1].complete = true;
            completedSections++;
        }
        if (collection.difficultyLevel !== undefined && collection.notes !== undefined &&
            collection.difficultyLevel.length > 0 && collection.notes.length > 0) {
            sidebarMenuItems[1].submenu[2].complete = true;
            completedSections++;
        }
        // if (collection.maxSpots !== undefined && collection.maxSpots.length > 0) {
        //     sidebarMenuItems[1].submenu[3].complete = true;
        //     completedSections++;
        // }
        if ((collection.imageUrls && collection.imageUrls.length > 0)
            || (collection.videoUrls && collection.videoUrls.length > 0)) {
            sidebarMenuItems[1].submenu[3].complete = true;
            completedSections++;
        } else {
            sidebarMenuItems[1].submenu[3].complete = false;
        }
        if (collection.rewards && collection.rewards.length > 0) {
            sidebarMenuItems[1].submenu[5].complete = true;
            completedSections++;
        }
        if (collection.price !== undefined && collection.currency && collection.cancellationPolicy && collection.academicGyan !== undefined && collection.nonAcademicGyan !== undefined) {
            sidebarMenuItems[1].submenu[6].complete = true;
            completedSections++;
        }
        if (collection.contents !== undefined && collection.contents.length > 0) {
            sidebarMenuItems[2].submenu.forEach(item => {
                item.complete = true;
            });
            completedSections++;
        }
        sidebarMenuItems[3].locked = completedSections !== 11;
        if (collection.owners !== undefined && collection.owners[0].phoneVerified) {
            sidebarMenuItems[4].submenu[0].complete = true;
        }
        return sidebarMenuItems;
    }

}


interface SessionConfigObject {
    sessionObject?: any;
    profileObject?: any;
    educationObject?: any;
    topicsObject?: any;
    provisionObject?: any;
    availabilityObject?: any;
    priceObject?: any;
    preferenceObject?: any;
}
