var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    data_model.getAll(col_routes, (resp) => {
        data = {
            page: "routes",
            title: 'Nust Shuttles',
            plugins: ['charts'],
            user: req.user,
            routes: resp
        }
        res.render('routes', data);
    })
});
router.post('/add',saveLogs("Added Route"), function (req, res, next) {
    data_model.add(col_routes, req.body, (resp) => {
        res.send(resp)
    })
});

router.get('/get', function (req, res, next) {
    data_model.getAll(col_routes, (resp) => {
        res.send(resp)
    })
});

router.delete('/delete/:id', function (req, res, next) {
    data_model.delete(col_routes,req.params.id, (resp) => {
        res.send(resp)
    })
});

module.exports = router;
