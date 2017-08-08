var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/entry.html', function(req, res, next) {
	res.render('index/entry')
});

module.exports = router;
