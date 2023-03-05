'use strict';

window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('isLoaded');
    }, 100);
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
                if (document.body.classList.contains('menu-active')) {
                    this.closeMenu();
                } else {
                    this.openMenu();

                }

            })

            this.menuItemsParent.addEventListener('click', (e) => {
                let target = e.target;

                if (target.tagName === 'A') {
                    this.closeMenu();
                }
            })
        }

        openMenu() {
            document.body.classList.add('menu-active');
            document.body.style.paddingRight = `${this.getScrollBarWidth()}px`;
        }

        closeMenu() {
            document.body.classList.remove('menu-active');
            document.body.style.paddingRight = `0px`;
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
            this.sliderSelector = obj.sliderSelector;
            this.slidesSelector = obj.slidesSelector;
            this.wrapperSelector = obj.wrapperSelector;
            this.trackSelector = obj.trackSelector;
            this.btnNextSelector = obj.btnNextSelector;
            this.btnPrevSelector = obj.btnPrevSelector;
            this.pagination = obj.pagination;
            this.index = 0;
            this.currentSlide = 0;
            this.currentDot = 0;
            this.indicators = [];
            this.firstInit = true;
            this.movePosition = 0;
            this.position = 0;
            this.width = null;
            this.treshold = 140;
            this.allowedTime = 200;
            this._startX = 0;
            this._startY = 0;
            this._startTime = 0;
        }

        init() {
            this.slider = document.querySelector(this.sliderSelector);

            if (!this.slider) {
                return;
            }

            this.slides = document.querySelectorAll(this.slidesSelector);
            this.slidesLength = this.slides.length;
            this.track = document.querySelector(this.trackSelector);
            this.wrapper = document.querySelector(this.wrapperSelector);
            this.btnNext = document.querySelector(this.btnNextSelector);
            this.btnPrev = document.querySelector(this.btnPrevSelector);

            this.calc();

            this.btnNext.addEventListener('click', () => {
                this.next();
            })

            this.btnPrev.addEventListener('click', () => {
                this.prev();
            })

            window.addEventListener('keydown', (e) => {
                if (e.keyCode === 39) {
                    this.next();
                }
                if (e.keyCode === 37) {
                    this.prev();
                }
            })

            if (this.pagination) {
                const dots = document.createElement('ul');
                dots.classList.add('dots');
                this.wrapper.appendChild(dots);

                for (let i = 0; i < this.slidesLength; i++) {
                    const dot = document.createElement('li');
                    dot.classList.add('dot');
                    dot.setAttribute('data-slide-to', i);

                    if (i === 0) {
                        dot.classList.add('dot-active');
                    }

                    dots.appendChild(dot);
                    this.indicators.push(dot);
                }

                dots.addEventListener('click', (e) => {
                    const target = e.target;
                    if (target.tagName === 'LI') {
                        const slideTo = target.getAttribute('data-slide-to');
                        this.position = -(slideTo * this.movePosition);
                        this.setPosition();
                        this.indicators.forEach(item => {
                            item.classList.remove('dot-active');
                        })
                        this.indicators[slideTo].classList.add('dot-active');
                    }
                })
            }

            this.slider.addEventListener('touchstart', (e) => {
                const touchObj = e.changedTouches[0];
                this._startX = touchObj.pageX;
                this._startY = touchObj.pageY;
                this._startTime = new Date().getTime();
            }, {
                passive: true
            });

            this.slider.addEventListener('touchend', (e) => {
                const touchObj = e.changedTouches[0];
                const dist = touchObj.pageX - this._startX;
                const elapsedTime = new Date().getTime() - this._startTime;

                if (Math.abs(touchObj.pageY - this._startY) < 100 &&
                    elapsedTime <= this.allowedTime &&
                    Math.abs(dist) >= this.treshold) {
                    const swiperRightBol = dist > 0;

                    if (swiperRightBol) {
                        this.prev();
                    } else {
                        this.next();
                    }

                }
            }, {
                passive: true
            });

            window.addEventListener('resize', (e) => {
                this.track.classList.remove('animated');
                this.calc();
                this.position = -(this.currentSlide * this.movePosition);
                this.setPosition();
            });
        }
        calc() {

            this.track.style.width = 100 * this.slides.length + '%';

            this.movePosition = window.getComputedStyle(this.wrapper).width;
            this.movePosition = this.deleteNoDigits(this.movePosition);

            this.leftX = this.slides[1].getBoundingClientRect().left;

            this.setPosition();
            this.track.offsetHeight;
            this.track.classList.add('animated');
        }

        setPosition() {
            this.track.style.transform = `translateX(${this.position}px)`;
        }

        deleteNoDigits(str) {
            return +str.replace(/[A-Za-z]/g, '');
        }

        next() {
            if (this.firstInit) {
                this.calc();
                this.firstInit = false;
            }
            if (this.slides[0].getBoundingClientRect().right < 0) {

                let temp = this.track.removeChild(this.slides[0]);
                this.track.appendChild(temp);

                this.slides = document.querySelectorAll(this.slidesSelector);

                this.position += this.movePosition;
                this.currentSlide--;
                this.track.classList.remove('animated');
                this.setPosition();
                this.track.offsetHeight;
                this.track.classList.add('animated');
            }

            this.position -= this.movePosition;
            this.currentSlide++;

            this.setPosition();
            this.currentDot++;
            if (this.currentDot >= this.indicators.length) {
                this.currentDot = 0;
            }
            this.updateDot();
        }

        prev() {
            if (this.firstInit) {
                this.calc();
                this.firstInit = false;
            }

            if (this.slides[this.slides.length - 1].getBoundingClientRect().left > 0) {

                let temp = this.track.removeChild(this.slides[this.slides.length - 1]);
                this.track.insertBefore(temp, this.slides[0]);

                this.slides = document.querySelectorAll(this.slidesSelector);

                this.position -= this.movePosition;
                this.currentSlide++;
                this.track.classList.remove('animated');
                this.setPosition();
                this.track.offsetHeight;
                this.track.classList.add('animated');

            }
            this.position += this.movePosition;
            this.currentSlide--;
            this.setPosition();
            this.currentDot--;
            if (this.currentDot < 0) {
                this.currentDot = this.indicators.length - 1;
            }
            this.updateDot();
        }

        updateDot() {
            this.indicators.forEach(item => {
                item.classList.remove('dot-active');
            })
            this.indicators[this.currentDot].classList.add('dot-active');
        }

    }


    const slider = document.querySelectorAll('.slider');

    if (slider.length !== 0)
        new Slider({
            sliderSelector: '.slider',
            slidesSelector: '.slide',
            wrapperSelector: '.slider-wrapper',
            trackSelector: '.slider-track',
            btnNextSelector: '.btn-next',
            btnPrevSelector: '.btn-prev',
            pagination: true,
        }).init();



    class Popup {
        constructor(popupSelector, btnShowSelector, overlaySelector, popupFormSelector, errorMessageSelector) {
            this.popupSelector = popupSelector;
            this.btnShowSelector = btnShowSelector;
            this.overlaySelector = overlaySelector;
            this.popupFormSelector = popupFormSelector;
            this.errorMessageSelector = errorMessageSelector;
            this.currentPopup = null;
            this.btnClose = null;
        }

        init() {
            this.popup = document.querySelector(this.popupSelector);
            this.btnShowPopup = document.querySelector(this.btnShowSelector);
            this.popupForm = document.querySelector(this.popupFormSelector);
            this.overlay = document.querySelector(this.overlaySelector);
            this.errorMessages = document.querySelectorAll(this.errorMessageSelector);
            this.form = this.popup.querySelector('form');

            if(this.form) {
                this.initForm(this.form);
            }


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

        initForm(form) {
            this.radioButtons = form.querySelectorAll('input[type=radio]'),
            this.selectGroup = form.querySelector('.select-group'),
            this.selectLabel = form.querySelector('#select-label'),
            this.selectBtn = this.selectGroup.querySelector('button'),
            this.formInputs = form.querySelectorAll('input');
        }

       resetCustomSelect() {
            if(this.radioButtons && this.selectLabel) {
                this.radioButtons.forEach(btn => {
                    btn.checked = false;
                    this.selectLabel.innerText = '- Please select one -'; 
                })
                this.selectBtn.classList.remove('error');
            }
        }
    
        resetInputs ()  {
            this.formInputs.forEach(input => input.classList.remove('error'));
        }

        showPopup(e) {
            const target = e.target;
            const popupId = target.getAttribute('data-modal')
            this.currentPopup = document.querySelector(`#${popupId}`);

            this.overlay.classList.add('showOverlay');
            this.currentPopup.classList.add('showPopup');
            document.body.style.overflow = 'hidden';
        }

        closePopup() {
            this.overlay.classList.remove('showOverlay');
            this.currentPopup.classList.remove('showPopup');
            this.popupForm.reset();
            this.errorMessages.forEach(message => {
                message.textContent = '';
            })
            this.resetCustomSelect();
            this.resetInputs();
            document.body.style.overflow = '';
        }
    }

    const popup = new Popup('.popup', '.btn-show', '.overlay', '.popup form', '.popup form .error-message').init();


    const resetCustomSelect = (form) => {
        const radioButtons = form.querySelectorAll('input[type=radio]'),
        selectGroup = form.querySelector('.select-group'),
        selectLabel = form.querySelector('#select-label'),
        selectBtn = selectGroup.querySelector('button');

        if(radioButtons && selectLabel) {
            radioButtons.forEach(btn => {
                btn.checked = false;
                selectLabel.innerText = '- Please select one -'; 
            })
            selectBtn.classList.remove('error');
        }
    }

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });
    
        return await res.json();
    };
    
    
    const bindPostData= (form) => {
       
            const formData = new FormData(form);
            const json = JSON.stringify(Object.fromEntries(formData.entries()));
            
            console.log(json)
            postData('http://localhost:3000', json)
                .then(data => {
                    console.log(data)
                    
                }).catch(() => {
                    
                }).finally(() => {
                    form.reset();
                    resetCustomSelect(form);
                })
    }

    class Form {
        constructor(obj) {
            this.formSelector = obj.form;
            this.errorClass = obj.errorClass;
        }

        init() {
            this.forms = document.querySelectorAll(this.formSelector);

            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const currentForm = e.target;
                
                    const validation = this.validateForm(currentForm);

                    if (validation) {
                        bindPostData(currentForm);
                    }
                })
            })
        }

        validateForm(form) {
            const regexpEmail = /^[0-9a-z_.-]+@[0-9a-z_^.]+.[a-z]{2,3}$/i;

            let error = false,
                removeError = true;

            const requiredFields = form.querySelectorAll('.required');
            const messageSpan = form.querySelectorAll('.error-message');


            const inputName = form.querySelector('input[name=name]'),
                inputPhone = form.querySelector('input[type=tel]'),
                selectGroup = form.querySelector('.select-group'),
                selectRadio = form.querySelectorAll('.option'),
                selectItems = form.querySelectorAll('.select-item');

            if (inputPhone) {
                inputPhone.addEventListener('input', () => {
                    inputPhone.value = inputPhone.value.replace(/\D/, '');
                })
            }


            inputName.addEventListener('input', () => {
                inputName.value = inputName.value.replace(/\d/, '');
            })



            const fieldsLength = requiredFields.length;
            const message = {
                fill: 'Fill in the field',
                format: 'Enter a correct email',
                checkOption: 'Choose a course option'
            }

            if (selectItems && selectGroup) {
                const checkRadio = el => el.getAttribute('checked'),
                    selectMessage = selectGroup.querySelector('.error-message'),
                    selectButton = selectGroup.querySelector('.select-group__button');

                    selectButton.classList.add(this.errorClass);

                const notChecked = Array.from(selectRadio).some(checkRadio);
                if (!notChecked) {
                    error = true;
                    removeError = false;

                    selectMessage.textContent = message.checkOption;
                } else {
                    selectMessage.textContent = '';
                }
            }

            for (let i = 0; i < fieldsLength; i++) {
                const field = requiredFields[i],
                    messageField = messageSpan[i];
                
                if (field.getAttribute('name') === 'email' && !regexpEmail.test(field.value)) {
                    field.classList.add(this.errorClass);
                    messageField.textContent = message.format;
                    error = true;
                    removeError = false;
                }

                if (field.value === '') {
                    field.classList.add(this.errorClass);
                    messageField.textContent = message.fill;
                    error = true;
                    removeError = false;
                }

                if (removeError) {
                    field.classList.remove(this.errorClass);
                    messageField.textContent = '';
                }
            }
            return !error;
        }

    }


    new Form({
        form: 'form',
        errorClass: 'error',
    }).init();



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

        if (lazyImages.length > 0) {
            lazyImages.forEach(img => {
                if (img.dataset.src || dataset.srcset) {
                    const position = img.getBoundingClientRect().top + pageYOffset;
                    lazyImagesPosition.push(position);
                    checkScrollPosition();
                }
            })
        }

        window.addEventListener('scroll', lazyScroll);

        function lazyScroll() {
            if (document.querySelectorAll('img[data-src],source[data-srcset]').length > 0) {
                checkScrollPosition();
            }
        }

        function checkScrollPosition() {
            let imgPosIndex = lazyImagesPosition.findIndex(item => pageYOffset > item - windowHeight);
            if (imgPosIndex >= 0) {
                if (lazyImages[imgPosIndex].dataset.src) {
                    lazyImages[imgPosIndex].src = lazyImages[imgPosIndex].dataset.src;
                    lazyImages[imgPosIndex].removeAttribute('data-src');
                } else if (lazyImages[imgPosIndex].dataset.srcset) {
                    lazyImages[imgPosIndex].srcset = lazyImages[imgPosIndex].dataset.srcset;
                    lazyImages[imgPosIndex].removeAttribute('data-srcset');
                }
                delete lazyImagesPosition[imgPosIndex];
            }
        }

    }

    lazyLoading();


    const customSelect = (selectBtnSelector, optionSelector, selectLabelSelector, selectDropdownSelector) => {
        const selectBtn = document.querySelector(selectBtnSelector),
            options = document.querySelectorAll(optionSelector),
            selectLabel = document.querySelector(selectLabelSelector),
            selectDropdown = document.querySelector(selectDropdownSelector);


        selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleHidden();
        })

        options.forEach(item => {
            item.addEventListener('click', (e) => {
                setSelectTiltle(e);
                toggleHidden();
            })
        })

        function toggleHidden() {
            selectDropdown.classList.toggle('hidden');
        }

        function setSelectTiltle(e) {
            const labelElement = document.querySelector(`label[for="${e.target.id}"]`),
                radioButton = labelElement.nextElementSibling;

            const labelText = labelElement.innerText;
            radioButton.setAttribute('checked', 'checked');

            selectLabel.innerText = labelText;
        }
    }

    customSelect('.select-group__button', '.option', '#select-label', '.dropdown');
})