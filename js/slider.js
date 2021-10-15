function OMSSSlider(attrPrefix='slider', customClasses={}) {
    const classes = Object.assign({
        endArrow: 'arrow-end',
        navItemCurrent: 'current'
    }, customClasses);


    const $ = (id, isAll=false, parentEl=document) => {
        const returnValue = (parentEl || document)[isAll ? 'querySelectorAll' : 'querySelector'](`[data-${attrPrefix}=${id}]`);
        return isAll ? Array.from(returnValue) : returnValue;
    }

    const container = $('container');
    const leftArrow = $('left-arrow', false, container);
    const rightArrow = $('right-arrow', false, container);
    const slider = $('slider', false, container);
    const slides = $('slide', true, slider);
    const nav = $('nav', false, container);
    const navItem = $('nav-item', false, nav);
    navItem.parentElement.removeChild(navItem);
    const navItems = [];

    let slideIndex = 0;

    /*  Generate nav dots for each CMS slide  */
    for (let i = 0; i < slides.length; i++) {
        var newNavItem = navItem.cloneNode(true);
        $('nav-item-number', false, newNavItem).innerHTML = i + 1;
        newNavItem.addEventListener('click', onNavItemClick);
        newNavItem.dataset.index = i;
        nav.append(newNavItem);
        navItems.push(newNavItem);
    }

    /*  Click detection for nav dots. Activate the corresponding slide
    and update the left/right arrows if on the first or last slide  */
    function onNavItemClick(ev) {
        const oldSlideIndex = slideIndex;
        const newSlideIndex = parseInt(ev.currentTarget.dataset.index);
        updateView(newSlideIndex, oldSlideIndex);
    }

    /*  Right Arrow click detection and actions. */
    rightArrow.addEventListener('click', function() {
        if (slideIndex >= slides.length - 1) {
            return;
        }
        const oldSlideIndex = slideIndex;
        const newSlideIndex = slideIndex + 1;
        updateView(newSlideIndex, oldSlideIndex);
    });

    /*  Left Arrow click detection and actions. */
    leftArrow.addEventListener('click', function() {
        if (slideIndex <= 0) {
            return;
        }
        const oldSlideIndex = slideIndex;
        const newSlideIndex = slideIndex - 1;
        updateView(newSlideIndex, oldSlideIndex);
    });

    /*  Function called on by arrow and nav dot clicks to move to
    the selected slide  */
    function updateView(newIndex, oldIndex) {
        slideIndex = newIndex;
        leftArrow.classList.toggle(classes.endArrow, slideIndex === 0);
        rightArrow.classList.toggle(classes.endArrow, slideIndex === slides.length - 1);
        navItems[oldIndex].classList.remove(classes.navItemCurrent);
        navItems[newIndex].classList.add(classes.navItemCurrent);

        const xPosPercent = slideIndex * -100;
        slider.style = `
            -webkit-transform: translateX(${xPosPercent}%);
            -moz-transform: translateX(${xPosPercent}%);
            -ms-transform: translateX(${xPosPercent}%);
            -o-transform: translateX(${xPosPercent}%);
            transform: translateX(${xPosPercent}%);
        `;
        if (slides[oldIndex].dataset.sliderType === 'youtube' && slides[oldIndex].player) {
            slides[oldIndex].player.pauseVideo();
        }
    }
    updateView(slideIndex, slideIndex);

    const containerStyle = window.getComputedStyle(container);
    function getContainerDimemsions() {
        const w = parseInt(containerStyle.width);
        const h = parseInt(containerStyle.height);
        const ratio = w / h;
        return {w,h,ratio};
    }
    const youtubeSlides = slides.filter(slide => slide.dataset.sliderType === 'youtube');
    youtubeSlides.forEach(slide => {
        const el = document.querySelector('[data-youtube]');
        el.id = 'youtube-player-'+el.dataset.youtube;
        slide.playerEl = el;
    });

    function initYoutubePlayer(slide) {
        slide.player = new YT.Player(slide.playerEl.id, {
            videoId: slide.playerEl.dataset.youtube,
            width: 'auto',
            height: 'auto',
            playerVars: {
                'playsinline': 1
            },
            events: {
                'onReady': function onPlayerReady(event) {
                    slide.playerEl = document.getElementById(slide.playerEl.id);
                }
                // 'onStateChange':function onPlayerStateChange() {}
            }
        });
    }
    window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
        youtubeSlides.forEach(slide => initYoutubePlayer(slide));
    }
    if (youtubeSlides.length) {
        const youtubeApi = document.createElement('script');
        youtubeApi.src = "https://www.youtube.com/iframe_api";
        document.querySelector('head').appendChild(youtubeApi);
    }

    function fitYoutubeIframes() {
        const iframeRatio = 1.801178203;
        youtubeSlides.forEach(youtubeSlide => {
            const {w,h,ratio} = getContainerDimemsions();
            youtubeSlide.playerEl.style.height = ratio > iframeRatio ? String(h) + 'px' : String(w / iframeRatio) + 'px';
            youtubeSlide.playerEl.style.width = ratio > iframeRatio ? String(h * iframeRatio) + 'px' : String(w) + 'px';
            youtubeSlide.playerEl.style.position = 'static';
            youtubeSlide.style.backgroundImage = 'none';
            youtubeSlide.style.paddingTop = 'unset';
        });
    }
    // SLIDER YOUTUBE
    const imageSlides = slides.filter(slide => slide.dataset.sliderType === 'image')
    const imageSlidesImages = imageSlides.map(slide => slide.querySelector('img'));
    const imageSlidesImagesStyles = imageSlidesImages.map(img => window.getComputedStyle(img));

    function fitImage(i) {
        const {w,h,ratio} = getContainerDimemsions();
        const imgW = parseInt(imageSlidesImagesStyles[i].width);
        const imgH = parseInt(imageSlidesImagesStyles[i].height);
        if (imgW === 0 || imgH === 0) {
            return;
        }
        const imgRatio = imgW / imgH;
        imageSlidesImages[i].style.height = ratio > imgRatio ? String(h)+'px' : String(w / imgRatio) + 'px';
        imageSlidesImages[i].style.width = ratio > imgRatio ? String(h * imgRatio) + 'px' : String(w) + 'px';
        imageSlidesImages[i].style.position = 'static';
        imageSlides[i].style.backgroundImage = 'none';
        imageSlides[i].style.paddingTop = 'unset';
    }

    imageSlidesImages.forEach((img,i) => img.addEventListener('load', fitImage.bind(this, i)));

    function fitImages() {
        imageSlides.forEach((imageSlide, i) => {
            fitImage(i);
        });
    }
    const fitSlideContents = () => {
        fitYoutubeIframes();
        fitImages();
    };
    window.addEventListener('resize', fitSlideContents);

    // custom event triggered by outside other js components (like full-screen)
    container.addEventListener('force-update', fitSlideContents);

    fitSlideContents();
}