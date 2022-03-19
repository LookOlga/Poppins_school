'use strict';

window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('isLoaded');
    }, 400);
})

window.addEventListener('DOMContentLoaded', () => {

    class menuBurger {
        constructor(selector, menuItemsParent) {
            this.selector = selector;
            this.menuItemsParent = menuItemsParent;
        }

        init() {
            this.selector = document.querySelector(this.selector);
            this.menuItemsParent = document.querySelector(this.menuItemsParent);

            this.selector.addEventListener('click', () => {
                // if(document.body.classList.contains('menu-active')) {
                //     document.body.style.paddingRight = `0px`;
                // } else {
                //     document.body.style.paddingRight = `${this.getScrollBarWidth()}px`;
                // }

                document.body.classList.toggle('menu-active');
            })

            this.menuItemsParent.addEventListener('click', (e) => {
                let target = e.target;

                if (target.tagName === 'A') {
                    document.body.classList.toggle('menu-active');
                }
            })
        }

        getScrollBarWidth() {
            const bar = document.createElement('div');

            bar.style.cssText = `
                position: absolute;
                top: -10000px;
                width: 50px;
                height: 50px;
                overflow: scroll;
                visibility: hidden;
            `;

            document.body.appendChild(bar);

            const scrollBarWidth = bar.offsetWidth - bar.clientWidth;

            document.body.removeChild(bar);

            return scrollBarWidth;

        }
    }

    new menuBurger('.header__burger', '.header__items').init();


    class Slider {
        constructor(obj) {
            this.slider = obj.slider;
            this.slides = obj.slides;
            this.wrapper = obj.wrapper;
            this.track = obj.track;
            this.pagination = obj.pagination;
            this.index = 0;
            this.position = 0;
            this.width = null;
        }

        init() {
            this.slides = document.querySelectorAll(this.slides);
            this.slider = document.querySelector(this.slider);
            this.wrapper = document.querySelector(this.wrapper);

            this.track = document.querySelector(this.track);

            this.calc();

            if (this.pagination) {
                const dots = document.createElement('ul'),
                    controls = [];
                dots.classList.add('slider-dots');
                this.slider.append(dots);

                let slidesLength = this.slides.length;
                for (let i = 0; i < slidesLength; i++) {
                    const dot = document.createElement('li');
                    dot.setAttribute('data-slide-to', i);
                    dot.classList.add('dot');

                    if (i === 0) {
                        dot.classList.add('dot-active');
                    }
                    dots.append(dot);
                    controls.push(dot);
                }

                dots.addEventListener('click', (e) => {
                    let target = e.target;

                    if (target.tagName === 'LI') {
                        const slideTo = target.getAttribute('data-slide-to');

                        controls.forEach(dot => dot.classList.remove('dot-active'));
                        target.classList.add('dot-active');
                        this.index = slideTo;
                        this.position = this.deleteNodigits(this.width) * this.index;
                        this.track.style.transition = 'transform 0.5s';
                        this.movePosition();

                    }
                })
            }

            window.addEventListener('resize', (e) => {
                this.track.style.transition = '';
                this.calc();
                this.position = this.deleteNodigits(this.width) * this.index;
                this.movePosition();
            });
        }
        calc() {
            this.track.style.width = 100 * this.slides.length + '%';

            this.width = window.getComputedStyle(this.wrapper).width;

            this.slides.forEach(slide => {
                slide.style.width = this.width;
            })
        }

        movePosition() {
            this.track.style.transform = `translateX(-${this.position}px)`;
        }

        deleteNodigits(str) {
            return +str.replace(/\D/g, '');
        }

    }


    const slider = document.querySelectorAll('.slider');

    if (slider.length !== 0)
        new Slider({
            slider: '.slider',
            slides: '.slide',
            wrapper: '.slider-wrapper',
            track: '.slider-track',
            pagination: true,
        }).init();



    class Popup {
        constructor(popup, btnShow, overlay) {
            this.popup = popup;
            this.btnShow = btnShow;
            this.overlay = overlay;
            this.currentPopup = null;
            this.btnClose = null;
        }

        init() {
            this.popup = document.querySelector(this.popup);
            this.btnShowPopup = document.querySelector(this.btnShow);
            this.overlay = document.querySelector(this.overlay);

            this.btnShowPopup.addEventListener('click', (e) => {
                this.showPopup(e);
                if (this.currentPopup !== null) {
                    this.btnClose = this.currentPopup.querySelector('.popup__close');
                    this.btnClose.addEventListener('click', () => {
                        this.closePopup();
                    })
                }
            })
           
            this.overlay.addEventListener('click', (e) => {
                const target = e.target;

                if (target === this.overlay) {
                    this.closePopup();
                }
            })

        }

        showPopup(e) {
            const target = e.target;
            const popupId = target.getAttribute('data-modal')
            this.currentPopup = document.querySelector(`#${popupId}`);

            this.overlay.classList.add('showOverlay');
            this.currentPopup.classList.add('showPopup');
        }

        closePopup() {
            this.overlay.classList.remove('showOverlay');
            this.currentPopup.classList.remove('showPopup');
        }
    }

    const popup = new Popup('.popup', '.btn-show', '.overlay').init();



    const allTextareas = document.querySelectorAll('textarea');

    allTextareas.forEach(el => {
        el.addEventListener('input', (e) => {
            const target = e.target;

            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
        })
    })


    const lazyLoading = () => {
        const lazyImages = document.querySelectorAll('[data-src]'),
                windowHeight = document.documentElement.clientHeight;

        let lazyImagesPosition = [];

        if(lazyImages.length > 0) {
            lazyImages.forEach(img => {
                if(img.dataset.src || dataset.srcset) {
                    const position = img.getBoundingClientRect().top + pageYOffset;
                    lazyImagesPosition.push(position);
                    checkScrollPosition();
                }
            })
        }

        window.addEventListener('scroll', lazyScroll);

        function lazyScroll() {
            if(document.querySelectorAll('img[data-src],source[data-srcset]').length > 0) {
                checkScrollPosition();
            }
        }

        function checkScrollPosition () {
           let imgPosIndex =  lazyImagesPosition.findIndex(item => pageYOffset > item - windowHeight);
           if(imgPosIndex >= 0) {
               if(lazyImages[imgPosIndex].dataset.src) {
                lazyImages[imgPosIndex].src = lazyImages[imgPosIndex].dataset.src;
                lazyImages[imgPosIndex].removeAttribute('data-src');
               } else if (lazyImages[imgPosIndex].dataset.srcset) {
                lazyImages[imgPosIndex].srcset = lazyImages[imgPosIndex].dataset.srcset;
                lazyImages[imgPosIndex].removeAttribute('data-srcset');
               }
               delete lazyImagesPosition[imgPosIndex];
           }
        }

        console.log(lazyImages);
    }

    lazyLoading();
})