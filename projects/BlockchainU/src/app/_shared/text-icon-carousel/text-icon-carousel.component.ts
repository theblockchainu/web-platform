import { Component, OnInit } from '@angular/core';
import { NguCarouselStore } from '@ngu/carousel';
import { CollectionService } from '../../_services/collection/collection.service';
@Component({
	selector: 'app-text-icon-carousel',
	templateUrl: './text-icon-carousel.component.html',
	styleUrls: ['./text-icon-carousel.component.scss']
})

export class TextIconCarouselComponent implements OnInit {
	public carouselBanner: any;
	public testimonialArray: Array<TestimonialObject>;
	public currentTestimonial: number;
	public gotoSlide: number;
	constructor(public _collectionService: CollectionService) { }
	ngOnInit() {
		this.testimonialArray = [{
			pic_url: '/assets/images/images_landing/testimonial1.png',
			review: 'Your peerbuds account tracks everything you have ever learned in units called Gyan. Each Gyan represents the lowest level of learning possible in any particular subject. ',
			title: 'WHAT IS GYAN?'
		}, {
			pic_url: '/assets/images/images_landing/testimonial2.png',
			review: 'You can earn Gyan from a formal institution like a school or your work place. You can also earn from individuals or informal groups like a community center or an app.',
			title: 'HOW DO I EARN GYAN?'
		}, {
			pic_url: '/assets/images/images_landing/testimonial3.png',
			review: 'Gyan is powered by the Blockchain. The same technology that powers Bitcoin. Every Gyan that has ever been earned is a permanent part of a growing public record of a collective learning and working.',
			title: 'IS GYAN TRUSTWORTHY?'
		},
			{
				pic_url: '/assets/images/images_landing/testimonial3.png',
				review: 'Your profile displays all the Gyan you have ever earned. Employers can this this information to offer you a job or a gig that matches your skills. It is also your stake on the platform and gives you higher voting powers within the community.',
				title: 'HOW CAN I USE GYAN?'
			}
		];
		
		this.carouselBanner = {
			grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
			slide: 1,
			speed: 400,
			interval: 10000,
			point: {
				visible: false
			},
			load: 1,
			loop: true,
			touch: true
		};
	}
	
	/* It will be triggered on every slide*/
	onmoveFn(data: NguCarouselStore) {
		this.currentTestimonial = data.currentSlide;
	}
	
	// /* change the active point in carousel */
	// private carouselPointActiver(): void {
	//   const i = Math.ceil(this.data.currentSlide / this.data.slideItems);
	//   this.pointers = i;
	// }
	moveTo(i) {
		this.gotoSlide = i;
	}
}


interface TestimonialObject {
	pic_url: string;
	title: string;
	review: string;
}
