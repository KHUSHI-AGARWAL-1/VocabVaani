const { authJwt } = require("../middlewares");
const express =  require('express');
const controller = require("../controllers/userController");
const Role = require("../models/roleModel");

const router = express.Router();


router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

  router.get("/api/test/all", controller.allAccess);

  router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  router.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  router.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  router.delete('/delete-account/:id' , async(req,res)=>{
    let {id} = req.params;
  
    let {user} = await User.findById(id)
    for(let idd of user.roles){
      await Role.findByIdAndDelete(idd);
  
    }
    await User.findByIdAndDelete(id);
    res.redirect('/home');
  })
  
  
module.exports = router;





















