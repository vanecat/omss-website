function OMSSContactForm(attrPrefix='form') {
    const bodyEl = document.querySelector('body');
    const $ = (id, isAll=false, parentEl=document) => {
        const returnValue = (parentEl || document)[isAll ? 'querySelectorAll' : 'querySelector'](`[data-${attrPrefix}=${id}]`);
        return isAll ? Array.from(returnValue) : returnValue;
    }

    let isRecaptchaInit = false;
    let recaptchaResponse = '';
    let grecaptchaId = '';
    const recaptchaEl = $('recaptcha');
    const initRecaptcha = () => {
        if (isRecaptchaInit) {
            return;
        }
        const grecaptchaCb = 'grecaptchaCallback_gjriqx41';
        const grecaptchaScript = document.createElement('script');
        grecaptchaScript.setAttribute('async', true);
        grecaptchaScript.setAttribute('defer', true);
        grecaptchaScript.setAttribute('src', `https://www.google.com/recaptcha/api.js?onload=${grecaptchaCb}&render=explicit`);
        bodyEl.appendChild(grecaptchaScript);

        window[grecaptchaCb] = () => {
            grecaptchaId = window.grecaptcha.render(recaptchaEl, {
                'sitekey' : '6LdYShIeAAAAAEq7LvsdRVBlKpJ6G4FUqcBYmsDk',
                'callback' : (recaptchaResponse_) => {
                    console.log(recaptchaResponse_);
                    recaptchaResponse = recaptchaResponse_;
                }
            });
            isRecaptchaInit = true;
        }
    }

    const formContainer = $('form');
    const form = formContainer.tagName === 'FORM' ? formContainer : formContainer.querySelector('form');
    const errors = $('errors', false, form);
    const success = $('success', false, form);
    const fields = $('field', true, form);
    const submit = $('submit', false, form);

    const onSubmit = ev => {
        ev.stopPropagation();
        ev.preventDefault();

        submit.disabled = true;
        const fieldValues = {};
        fields.forEach(f => {
            fieldValues[f.name] = f.value;
        });

        errors.style.display = 'none';
        success.style.display = 'none';

        if (!isRecaptchaInit) {
            setTimeout(() => {submit.disabled = false;}, 1000);
            alert('Recaptcha validation is still loading. Give it a second and press submit again!');
            return;
        }
        if (!recaptchaResponse) {
            setTimeout(() => {submit.disabled = false;}, 1000);
            alert('Did you complete recaptcha anti-robot/spam validation? If you did, it must be almost done validating. Give it a second and press submit again! Thank you!');
            return;
        } else {
            // add recaptcha response
            fieldValues.recaptcha = recaptchaResponse;
        }

        submitFn(form.action, fieldValues).then(r => {
            if (r.error && r.error.length) {
                errors.style.display = '';
                console.log(r.error);
                errors.innerHTML = r.error.join('<br/>');
                setTimeout(() => {submit.disabled = false;}, 1000);
            } else {
                success.style.display = '';
                submit.parentElement.removeChild(submit);
                recaptchaEl.parentElement.removeChild(recaptchaEl);

                const textFormEl = document.createElement('div');
                const firstFormElStyle = window.getComputedStyle(fields[Object.keys(fields)[0]]);
                textFormEl.style=`margin-bottom:20px; font-size: ${firstFormElStyle.fontSize}`; // make a placeholder with same font size as actual input el

                fields.forEach(f => {
                    const div = textFormEl.cloneNode();
                    // replace form el with text el, for safety
                    div.innerText = f.value;
                    f.parentElement.insertBefore(div, f);
                    f.parentElement.removeChild(f);
                });

            }
        })
    };

    async function submitFn(path, postParams) {
        const fetchOptions = {
            method: 'get',
            headers: {
                // 'Content-Type': 'application/json'
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache' // *default, no-cache, reload, force-cache, only-if-cached
        };

        if (postParams) {
            fetchOptions.method = 'post';
            fetchOptions.body = Object.entries(postParams).map(e => encodeURIComponent(e[0])+'='+encodeURIComponent(e[1])).join('&');
            // fetchOptions.body = JSON.stringify(postParams);
        }

        // fetchOptions.headers = {
        //     authorization: `Bearer ${tokenRes.token}`
        // };

        try {
            const url = `${path}`;
            // return Promise.resolve({}); // just to test submit
            const response = await fetch(url, fetchOptions);
            return await response.json();
        } catch(e) {
            return { error: e };
        }
    }



    let isInit = false;
    const init = () => {
        if (isInit) {
            return;
        }
        initRecaptcha();
        form.addEventListener('submit', onSubmit);

        isInit = true;
    };
    const initTrigger = $('init');
    initTrigger.addEventListener('click', init);
}