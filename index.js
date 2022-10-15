const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./src/database');

const PORT=80
const app = express();

const login = require("./routes/login");

app.set('view engine', 'ejs');
app.use(cookieParser("secret"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(verifyAccess);
app.use("/login", login);

app.get("/", (req, res) => {
    res.redirect("/login");
})

app.get("/disconnect", (req, res) => {
    let token = req.signedCookies.token;
    let database = utils.getDataBase();
    for(let auth of database.auths) {
        if(auth.token==token) {
            auth.expired = true;
        }
    }
    utils.storeDatabase(database);
    utils.clearExpiredAuthTokens();

    res.redirect("/login");
})



function verifyAccess(req, res) {
    if(!(db.isClientLogged(req.signedCookies)) && !(req.url=="/login" | req.url=="/register")) {
        res.redirect("/login");
    } else {
        req.next();
    }
}

app.listen(PORT);