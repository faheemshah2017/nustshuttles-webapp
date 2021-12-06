var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register',(req,res,next)=>{
  data_model.getBy(col_users,"email",req.body.email,(getResp)=>{
    if(!getResp){
      data_model.add(col_users,req.body,(saveResp)=>{
        res.send(saveResp)
      })
    }
    else{
      res.send(false)
    }
  })
})

module.exports = router;
