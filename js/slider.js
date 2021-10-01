
function OMSSInitOverlays() {
    const openEls = document.querySelectorAll('[data-overlay-open]');
    const closeEls = document.querySelectorAll('[data-overlay-close]');
    const els = document.querySelectorAll('[data-overlay]');
    if (closeEls.length !== els.length) {
        console.log('overlay elements mismatch', openEls, closeEls, els);
        return;
    }
    els.forEach(el => {
        const id = el.dataset.overlay;
        openEls.forEach(el2 => {
            if (el2.dataset.overlayOpen === id)  {
                el2.addEventListener('click', () => el.classList.remove('hidden'));
            }
        });
        closeEls.forEach(el2 => {
            if (el2.dataset.overlayClose === id)  {
                el2.addEventListener('click', () => el.classList.add('hidden'));
            }
        });
    });
}
OMSSInitOverlays();
function OMSSSlider() {
    const sliderContainer = document.querySelector('[data-slider=container]');
    // --------------- FULL SCREEN mode --------------------
    const isFullscreenAvailable = document.fullscreenEnabled;
    const openFullScreenEl = document.querySelector('[data-slider=full-screen]');
    const closeFullScreenEl = document.querySelector('[data-slider=exit-full-screen]');
    const openFullscreen = () => {
        if (sliderContainer.requestFullscreen) {
            sliderContainer.requestFullscreen();
        } else if (sliderContainer.mozRequestFullScreen) { /* Firefox */
            sliderContainer.mozRequestFullScreen();
        } else if (sliderContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            sliderContainer.webkitRequestFullscreen();
        } else if (sliderContainer.msRequestFullscreen) { /* IE/Edge */
            sliderContainer.msRequestFullscreen();
        }
    };
    /* Close fullscreen */
    const closeFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    };
    const updateFullScreenCtrls = () => {
        const isFullScreen = !!document.fullscreenElement;
        openFullScreenEl.classList.toggle('hidden', isFullScreen);
        closeFullScreenEl.classList.toggle('hidden', !isFullScreen);
    };
    if (isFullscreenAvailable && openFullScreenEl && closeFullScreenEl) {
        openFullScreenEl.addEventListener('click', openFullscreen);
        closeFullScreenEl.addEventListener('click', closeFullscreen);
        // on exiting full-screen lock is automatically released
        document.addEventListener("fullscreenchange", updateFullScreenCtrls);
        // for Chrome & Safari
        document.addEventListener("webkitfullscreenchange", updateFullScreenCtrls);
        updateFullScreenCtrls();
    }
    // SLIDER
    const sliderYoutube = document.querySelectorAll('[data-slider=youtube]');
    const sliderYoutubeIframe = document.querySelectorAll('[data-slider=youtube] iframe');
    const sliderContainerStyle = window.getComputedStyle(sliderContainer);
    const updateIframeInSlider = () => {
        const w = parseInt(sliderContainerStyle.width);
        const h = parseInt(sliderContainerStyle.height);
        const ratio = w / h;
        const expectedRatio = 1.801178203;
        sliderYoutube.forEach((el, i) => {
            el.style.backgroundImage = 'none';
            el.style.paddingTop = 'unset';
            sliderYoutubeIframe[i].style.position = 'static';
            sliderYoutubeIframe[i].style.height = ratio > expectedRatio ? String(h) + 'px' : String(w / expectedRatio) + 'px';
            sliderYoutubeIframe[i].style.width = ratio > expectedRatio ? String(h * expectedRatio) + 'px' : String(w) + 'px';
        });
    };
    window.addEventListener('resize', updateIframeInSlider);
    if (isFullscreenAvailable) {
        // on exiting full-screen lock is automatically released
        document.addEventListener("fullscreenchange", updateIframeInSlider);
        // for Chrome & Safari
        document.addEventListener("webkitfullscreenchange", updateIframeInSlider);
    }
    updateIframeInSlider();
}
OMSSSlider();
