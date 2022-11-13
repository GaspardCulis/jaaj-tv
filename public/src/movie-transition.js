function createSpacer(element) {
    const spacer = document.createElement("div");
    const rect = element.getBoundingClientRect();
    spacer.style.minWidth = rect.width + "px";
    spacer.style.minHeight = rect.height + "px";
    element.parentNode.insertBefore(spacer, element);
} 

function onMovieClicked(clicked_a) {
    for (let e of document.getElementsByClassName("fade-transition")) {
        e.classList.remove("fade-transition");
    }
    const rect = clicked_a.getBoundingClientRect();
    clicked_a.style.position = "fixed";
    createSpacer(clicked_a);
    clicked_a.style.top = `${rect.top}px`;
    clicked_a.style.left = `${rect.left}px`;
    setTimeout(() => {
        clicked_a.classList.add("is-showing");
    }, 10); 
}