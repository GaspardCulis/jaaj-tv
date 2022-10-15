const username_input = document.getElementById("username");
const password_input = document.getElementById("password");
const error_message = document.getElementById("error");
const form = document.getElementsByClassName("center")[0];
const spinny_boi = document.getElementById("spinny_boi");


function setSpinnyBoi() {
    spinny_boi.classList.add("appear");
    setTimeout(() => {
        spinny_boi.classList.remove("appear");
    }, 3200);
}

var waiting = false;
function onSubmit() {
    if(waiting) return;
    login_button.classList.add("clicked");
    setSpinnyBoi();
    setTimeout(() => {
        login_button.classList.remove("clicked");
        waiting = false;
    }, 3800)

    error_message.innerHTML = "";
    sendData({"username":username_input.value, "password":password_input.value}, "/login", 
    (response) => {
        response = JSON.parse(response);
        if(response.code==200) {
            spinny_boi.hidden = true;
            changePageSmooth(response.redirect);
        } else {
            waiting = true;
            setTimeout((message) => {
                error_message.innerHTML = message;
            }, 3000, response.message);
            
        }
    }, 
    () => {
        alert("Server unreachable.");
    })
}

setTimeout(()=>{
    spinny_boi.style.top = login_button.getBoundingClientRect().top - 17 + "px";
}, 1000);