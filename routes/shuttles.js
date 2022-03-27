var express = require('express');
var router = express.Router();

router.post('/location', function(req, res, next) {
  data_model.add(col_shuttles,req.body,(resp)=>{
    res.send(resp)
  })
});

router.get('/location', function(req, res, next) {
  data_model.getAll(col_shuttles,(resp)=>{
    res.send(resp)
  })
});

module.exports = router;
