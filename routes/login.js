const express = require('express');
const router = express.Router();
const db = require("../src/database")


router.get('/', (req, res) => {
    if (db.isClientLogged(req.signedCookies)) {
        res.redirect("/app");
    } else {
        res.render("login");
    }
})

router.post('/', (req, res) => {
    let loginValid = db.isLoginValid(req.body.username, req.body.password);
    if(loginValid) {
        console.log(req.body.username+" logged in !");
        let [token, maxAge] = db.createAuthToken(req.body.username);
        res.cookie('token', token, {maxAge: maxAge, signed: true});
        res.send({code: 200, redirect: "/app"});
    } else {
        res.send({code: 401, message: "Invalid username or password"});
    }
})

module.exports = router;