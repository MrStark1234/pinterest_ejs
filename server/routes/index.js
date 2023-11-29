var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");

const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/feed", function (req, res, next) {
  res.render("feed");
});
router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    //single('file')=> file likha hai same input me bhi name = "file " hona chahiye
    if (!req.file) {
      res.status(400).send("No file were uploaded");
    }
    // res.send("File uploaded successfully");
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const postData = await postModel.create({
      image: req.file.filename, // req.file.filename me uploaded image file ka naam hota hai
      caption: req.body.caption,
      user: user._id, // yaha post ko user ki ID de rahe hai
    });

    user.posts.push(postData._id); // user schema me jo posts bana hai usme iss ban rahe post ki ID daalni hai
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});
router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts"); // .populate user me bane "posts" ke array ko open karke uske data ko dikha raha hai

  res.render("profile", { user });
});

router.post("/register", function (req, res) {
  var userData = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
  });
  userModel
    .register(userData, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
