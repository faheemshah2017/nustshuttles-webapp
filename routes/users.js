var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const { authUser } = require('../models/user_model');

//------------------------- Users Crud --------------------------//
router.get('/list', authUser, function(req, res, next) {
    
    user_model.getPrivilegesList(function(rows_data) {
        plugins = SysConfig.plugins.default;
        plugins.push("datatables", "popper");
        
        data = {
            site_name: SysConfig.site_settings.site_name,
            title: "Users",
            page_id: "users-crud",
            menu_id: "user_management-users",
            user: {
            name: req.session.name,
            username: req.session.username
            },
            plugins: plugins,
            site_menu: req.site_menu,
            alerts: req.alerts,
            user_privileges: req.user.privileges,
            privileges: rows_data
        };
        
        res.render('index', data);
    });
});

router.post('/get_datatables_list', authUser, function(req, res, next) {
    
    user_model.getDatatablesList(req.body, function(rows_data) {
        res.setHeader('Content-Type', 'application/json');
        
        if(req.user.role == 'it_man'){
            rows_data.data = rows_data.data.filter(function(item) {
                if(item.role == 'super_user'||item.role == 'admin'||item.role == 'it_man'){
                    return false;
                }
                else{
                    return true;
                }
            });
        }
        if(req.user.role == 'admin'){
            rows_data.data = rows_data.data.filter(function(item) {
                if(item.role == 'super_user'||item.role == 'admin'){
                    return false;
                }
                else{
                    return true;
                }
            });
        }
        // if(req.user.role == 'super_user'){
        //     rows_data.data = rows_data.data.filter(function(item) { 
        //         return item.role !== 'super_user'
        //     });
        // }
        rows_data.recordsTotal = rows_data.data.length;
        rows_data.recordsFiltered = rows_data.data.length;

        res.send(JSON.stringify(rows_data));
    });
    
});

router.get('/details/:user_id', authUser, function (req, res, next) {

    user_model.getDetails(req.params.user_id, function(rows_data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows_data));
    });

});

// router.post('/register', function (req, res) {
//   data_model.getBy(col_users, "email", req.body.email, (getResp) => {
//     if (!getResp) {
//       user_model.addUser(req.body, req.body.password, function (saveResp) {
//         res.send(saveResp)
//       })
//     }
//     else {
//       res.send(false)
//     }
//   })
// });

router.post('/forgot_pass', function(req, res) {
    user_model.getUserByEmail(req.body.email,(user)=>{
        if(user){
            var transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            secure: false,
            auth: {
                    user: SysConfig.settings.email_settings.email,
                    pass: SysConfig.settings.email_settings.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            let token = generatetoken();
            console.log(token);
            baseUrl = "http://localhost:3000/"
            const mailOptions = {
                from: SysConfig.settings.email_settings.email, // sender address
                to: req.body.email, // list of receivers
                subject: 'Reset Password Requested', // Subject line
                html: `<p>Reset Password is requested at domain name <a href="${baseUrl}reset/${token}">click here</a> to reset password.</p>`// plain text body
            };
                
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                    console.log(err)
                else{
                    console.log(info);
                    console.log('email sent');
                }
            });

            user_model.addToken(req.body.email,token, function(result) {
                res.send({status:true});
            });
        }
        else{
            res.send({status:false});
        }
    })
});


var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

function generatetoken() {
    return rand() + rand(); // to make it longer
};

router.put('/update/privileges', function(req, res, next) {
    
    user_model.updateUserPrivileges(req.body.user_id, req.body.privilege_codes, function(result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });
    
});

router.put('/update/:id',authUser, function(req, res, next) {
    
    var data = {
        password: req.body.password
    }
    
    user_model.updateUser(req.params.id, data, function(result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });
    
});

router.put('/set_password/:token', function(req, res, next) {
    
    var data = {
        password: req.body.password
    }
    user_model.updatePassword(req.params.token, data, function(result) {
        res.send(true);
    });
    
});


router.put('/activate/:id',authUser, function(req, res, next) {
    user_model.activateUser(req.params.id, req.body, function(result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });
    
});


router.delete('/delete', function(req, res, next) {
    
    user_model.deleteUser(req.body.row_id, function(result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });
    
});

router.get('/logout', function(req, res) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('info', 'You are logged out');
      res.redirect('/login');
    });
});

// router.post('/auth', function(req, res, next) {
//     user_model.authUser(req, res, next);
// });

router.post('/auth', function(req, res) {
    user_model.authUser(req, res, function(user,info){
        if(user){
            res.redirect('/')
        }
        else{
            res.send(info);
        }
    });
});



module.exports = router;