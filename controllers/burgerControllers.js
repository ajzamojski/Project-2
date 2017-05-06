const Express = require("express"),
Burger = require("../models/burger.js"),
BodyParser = require("body-parser");

var router = Express.Router();
var urlEncodedParser = BodyParser.urlencoded({extended: false});

router.post("/api/addBurger", urlEncodedParser, function(req, res) {
	Burger.InsertOne(req, res);
});

router.put("/:id", function(req, res) {
	Burger.UpdateOne(req, res);
});

router.get("/", function(req, res) {
	Burger.SelectAll(req, res);
});

module.exports = router;