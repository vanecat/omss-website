function OMSSPopover(elSelector, openElSelector, closeElSelector, hiddenClass, shownClass, animationDurationMs, bodyNoScrollClass) {
    const bodyEl = document.querySelector('body');

    const els = {};
    document.querySelectorAll(elSelector).forEach(el => {
        const id = el.dataset.popoverId;
        if (!id) { return; }
        els[id] = el;
        const closeFn = (ev) => {
            el.classList.remove(shownClass);
            setTimeout(() => { el.classList.add(hiddenClass);}, animationDurationMs);
            bodyEl.classList.remove(bodyNoScrollClass);
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        }
        el.querySelectorAll(closeElSelector).forEach(closeEl => {
           closeEl.addEventListener('click', ev => closeFn(ev));
        });
        el.addEventListener('click', ev => {
            if (ev.target === el) {
                return closeFn(ev);
            }
        });
        bodyEl.addEventListener('keyup', ev => {
            if (ev.key === 'Escape') {
                return closeFn(ev);
            }
        })
        el.style.display = ''; // undo force-hide from DOM
    });
    document.querySelectorAll(openElSelector).forEach(openEl => {
        const el = !!openEl.dataset.popoverId ? els[openEl.dataset.popoverId] : null;
        if (el) {
            openEl.addEventListener('click', ev => {
                el.classList.remove(hiddenClass);
                setTimeout(() => {el.classList.add(shownClass);}, 1);
                bodyEl.classList.add(bodyNoScrollClass);
                ev.stopPropagation();
                ev.preventDefault();
                return false;
            });
        }
    });


    const style = OMSSCustomStyles();
    style.add(elSelector, `
        opacity: 0;
        transition: opacity ${animationDurationMs}ms ease-in;`
    );
    style.add(`${elSelector}.${shownClass}`, `
        opacity: 1;
    `);
}