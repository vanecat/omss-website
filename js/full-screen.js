function OMSSFullScreen(attrPrefix='full-screen') {
    const $ = (id, isAll=false, parentEl=document) => {
        const returnValue = parentEl[isAll ? 'querySelectorAll' : 'querySelector'](`[data-${attrPrefix}=${id}]`);
        return isAll ? Array.from(returnValue) : returnValue;
    }

    // --------------- FULL SCREEN mode --------------------
    const isFullscreenAvailable = document.fullscreenEnabled;
    const els = $('element', true);
    const enterEls = $('enter', true);
    enterEls.forEach(enterEl => enterEl.fullScreenEl = els.find(el => enterEl.dataset.fullScreenId && el.dataset.fullScreenId === enterEl.dataset.fullScreenId));
    const exitEls = $('exit', true);

    let currentEl = null;
    const enterFn = (el) => {
        currentEl = el;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) { /* Firefox */
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) { /* IE/Edge */
            el.msRequestFullscreen();
        }
    };
    /* Close fullscreen */
    const exitFn = () => {
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
    const updateControls = (ev) => {
        const isFullScreen = !!document.fullscreenElement;

        enterEls.forEach(el => el.style.display = isFullScreen ? 'none':'');
        exitEls.forEach(el => el.style.display = !isFullScreen ? 'none' : '');

        if (currentEl) {
            // make sure to trigger custom event for whoever might listening
            currentEl.dispatchEvent(new Event('force-update'));
        }

        // if going off full screen and it is done "going off", reset the "currentElement"
        if (!isFullScreen) {
            currentEl = null;
        }

        // if a new element vying to enter FULL SCREEN, exit first!
        if (currentEl && ev.target !== currentEl) {
            exitFn();
        }
    };
    if (isFullscreenAvailable) {
        enterEls.forEach(el => el.addEventListener('click', enterFn.bind(this, el.fullScreenEl)));
        exitEls.forEach(el => el.addEventListener('click', exitFn));
        // on exiting full-screen lock is automatically released
        document.addEventListener("fullscreenchange", updateControls);
        // for Chrome & Safari
        document.addEventListener("webkitfullscreenchange", updateControls);
        updateControls();
    }
    updateControls();
}