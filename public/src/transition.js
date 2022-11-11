let duration = parseInt(document.currentScript.getAttribute('data-duration')) || 500;

function animate() {
    document.documentElement.classList.add('is-leaving');
}

/**
 * @param { MouseEvent | PointerEvent } e
 */
function handleLoad(e) {
    let action;
    let target;
    let no_transition = false;
    const path = e.path || (e.composedPath && e.composedPath());
    for (let element of path) {
        if (! action) {
            if (element.tagName == 'A') {
                action = (element) => document.location.href = element.href;
                target = element;
            }
            else if (element.tagName == 'FORM') {
                action = (element) => element.submit();
                target = element;
            }
        }
        if(action || element == target) {
            no_transition = no_transition || (element.classList && element.classList.contains('no-transition'));
        }
    }
    if (! no_transition) {
        e.preventDefault();
        animate();
        setTimeout(action, duration, target);
    }
}

const disabled = localStorage.getItem('setting-page-transitions') === 'false';
document.addEventListener('DOMContentLoaded', () => {
    if (disabled) return;
    for (let a of document.getElementsByTagName("a")) {
        a.addEventListener('click', handleLoad, false);
    }
    for (let form of document.getElementsByTagName("form")) {
        form.addEventListener('submit', handleLoad);
    }
});
if (performance.getEntries()[0].type == 'reload' || disabled) 
        document.documentElement.classList.add('is-refreshed');
    else
        document.documentElement.classList.add('is-loaded');
