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
      review: 'Peerbuds is the best platform I came across so far, ' +
        'to learn while you earn. I feel so grateful to the people who made this possible!"',
      title: 'John Collins'
    }, {
      pic_url: '/assets/images/images_landing/testimonial2.png',
      review: 'Dont cry because its over, smile because it happened.',
      title: ' Dr. Seuss'
    }, {
      pic_url: '/assets/images/images_landing/testimonial3.png',
      review: 'Two things are infinite: the universe and human stupidity and Im not sure about the universe.',
      title: ' Albert Einstein'
    }
    ];

    this.carouselBanner = {
      grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
      slide: 1,
      speed: 400,
      interval: 4000,
      point: {
        visible: false
      },
      load: 2,
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
