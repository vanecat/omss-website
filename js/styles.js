function OMSSCustomStyles() {
    if (OMSSCustomStyles.INSTANCE) {
        return OMSSCustomStyles.INSTANCE;
    }
    const stylesheetEl = document.createElement('style');
    document.head.appendChild(stylesheetEl);

    const add = (selector, style) => {
        let styleStr = '';
        if (style instanceof Object) {
            styleStr = Object.keys(style).map(k => {
                return `  ${k}: ${String(style[k])};`;
            }).join("\n");
        } if (typeof style === 'string') {
            styleStr = style;
        }
        stylesheetEl.sheet.insertRule(`${selector} { \n  ${styleStr} \n}`);
    };

    const reset = () => {
        document.head.removeChild(stylesheetEl);
    };

    OMSSCustomStyles.INSTANCE = {
        add,
        reset
    };
    return OMSSCustomStyles.INSTANCE;
}