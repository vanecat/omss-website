function OMSSContactForm(attrPrefix='form') {
    const $ = (id, isAll=false, parentEl=document) => {
        const returnValue = (parentEl || document)[isAll ? 'querySelectorAll' : 'querySelector'](`[data-${attrPrefix}=${id}]`);
        return isAll ? Array.from(returnValue) : returnValue;
    }

    const form = $('form');
    const errors = $('errors', false, form);
    const success = $('success', false, form);
    const fields = $('field', true, form);
    const submit = $('submit', false, form);

    form.addEventListener('submit', ev => {
        ev.stopPropagation();
        ev.preventDefault();

        submit.disabled = true;
        const fieldValues = {};
        fields.forEach(f => {
            fieldValues[f.name] = f.value;
        });

        errors.style.display = 'none';
        success.style.display = 'none';
        submitFn(form.action, fieldValues).then(r => {
            if (r.error && r.error.length) {
                errors.style.display = '';
                console.log(r.error);
                errors.innerHTML = r.error.join('<br/>');
                setTimeout(() => {submit.disabled = false;}, 1000);
            } else {
                success.style.display = '';
                submit.style.display = 'none';
            }
        })
    })

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
            const response = await fetch(url, fetchOptions);
            return await response.json();
        } catch(e) {
            return { error: e };
        }
    }
}