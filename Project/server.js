var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');

var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');
var qt = require('quickthumb');
var fs1 = require('fs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

//app.use(session({ secret: 'this is the secret' }));
app.use(session({
    secret: 'this is the secret',
    saveUninitialized: true,
    resave: true
}));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session())

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/Project';

mongoose.connect(connectionString);

app.use(express.static(__dirname + '/travel'));

// -------------------------------------Schema----------------------------------- //

// Comment shown in Profile Page
var CommentUser = new mongoose.Schema({
    cityName: String,
    title: String,
    story: String,
    date: { type: Date, default: Date.now }
}, { collection: "CommentUser" });

// UserSchema
var UserSchema = new mongoose.Schema({
    image: {type: String, default: ""},
    username: String,
    email: String,
    password: String,
    description: {type: String, default: ""},
    countriesVisited: {type: String, default: ""},
    following: [{ type: String, default: "" }],
    followers: [{ type: String, default: "" }],
    reviewCount: { type: Number, default: 0 },
    comment: [CommentUser]
}, { collection: "UserSchema" });

var User = mongoose.model("User", UserSchema);

var Comment = new mongoose.Schema({
    username: String,
    rating: Number,
    title: String,
    story: String,
    date: { type: Date, default: Date.now }
}, {collection: "Comment"});

// Comment shown in City Page
var CommentCity = new mongoose.Schema({
    cityID: String,
    comment: [Comment]
}, { collection: "CommentCity" });

var City = mongoose.model("City", CommentCity);

// Message Schema
var MessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    message: String,
    date: {type: Date, default: Date.now}
}, {collection: "MessageSchema"});

var Message = mongoose.model("Message", MessageSchema);

// -----------------------Passport Authentication ------------------------ //

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    function (email, password, done) {
    User.findOne({ email: email, password: password }, function (err, user) {
        if (err)
            return done(err);
        if (!user)
            return done(null, false, {message: 'Unable to login'});
        return done(null, user);
    })
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

// ---------------------------Sign Up-------------------------------------- // 

app.post("/api/signup", function (req, res) {
    var user = req.body;
    console.log("USER");
    console.log(user);
    User.findOne({ 'username': user.username }, function (err, doc) {
        if (doc) {
            console.log("User already exists");
            res.send(404);
        }
        else {
            console.log("New User created");
            User.create({ username: user.username, email: user.email, password: user.password }, function (err, doc) {
                res.json(user);
            });
        }
    });
});

// ---------------------------Sign In----------------------------------------//

app.post("/login", passport.authenticate('local'), function (req, res) {
    var user = req.user;
    res.json(user);
});

// ------------------------------ Logout ------------------------------------ //

app.post('/logout', function (req, res) {
    req.logOut();
    res.send(200);
});

// ------------------------Check if User is logged In ------------------------//

app.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

// -----------------------Change Password--------------------------------------//


app.post("/api/changePassword", function (req, res) {
    var user = req.body;
    console.log(user);
    User.findOne({'username': user.username}, function (err, doc) {
        if (err) 
            throw (err);
        if(doc.password != user.oldpass)
            res.json({ oldpass : ""});
        else {
            User.update({ 'username' : user.username}, { $set: { 'password': user.newpass } }, { safe: true, upsert: true }, function (err, doc) {
                console.log("Password changed");
                res.json(doc);
            });
        }
    });
});

// ----------------------------Edit Profile--------------------------------------//

app.post("/api/editProfile", function (req, res) {
    var user = req.body;
    User.findOne({ 'username': user.username }, function (err, doc) {
        if (!doc) {
            console.log("Username Doesn't exist");
            res.json({ username: "" });
        }
        else {
            User.update({ 'username': user.username }, { $set: { 'countriesVisited': user.country, 'description': user.description } }, { safe: true, upsert: true }, function (err, doc) {
                console.log("Profile edited");
                res.json(doc);
            });
        }
    });
});

// ------------ Get user detail to populate in profile------------------------------- //

app.get("/api/profile/userdetail/:username", function (req, res) {
    var username = req.params.username;
    console.log(username);
    User.find({ 'username': username }, function (err, doc) {
        if (doc) {
            res.json(doc);
        } else {
            console.log("error in fetching user detial in server");
        }
    });
});

// -------------------------- Get all users ------------------------------------------// 

app.get("/api/getallusers", function (req, res) {
    User.find({}, function (err, docs) {
        if (docs) {
            res.json(docs);
        } else {
            console.log("error in getting all users");
        }
    });
})

// ---------------------------Add a review in City--------------------------------- //

app.post("/api/city/review", function (req, res) {
    console.log("review server");
    var cityId = req.body.cityId;
    City.findOneAndUpdate({ 'cityID': cityId }, { $push: { "comment": { username: req.body.username, rating: req.body.rating, title: req.body.title, story: req.body.story } } }, { safe: true, upsert: true }, function (err, doc) {
    //City.findOneAndUpdate({ 'cityID': cityId },
    //    {
    //        $push:
    //          {
    //              comment: {
    //                  $each: [{ username: req.body.username, rating: req.body.rating, title: req.body.title, story: req.body.story }],
    //                  $position: 0
    //              }
    //          }
    //    }, { safe: true, upsert: true }, function (err, doc) {
        if (doc) {
            console.log("doc");
            console.log(doc);
            res.json(doc);
        }
        else if (!doc) {
            console.log("no doc")
        }
        else {
            console.log("error in review");
        }
    })
});

// ---------------------------Add a review in DashBoard--------------------------------- //

app.post("/api/profile/review", function (req, res) {
    console.log("Inside profile review in server");
    var username = req.body.username;
    User.findOneAndUpdate({ 'username': username }, { $push: { "comment": { cityName: req.body.cityName, title: req.body.title, story: req.body.story } }, $inc: {reviewCount: 1} }, { safe: true, upsert: true }, function(err, doc){
        if (err)
            throw (err)
        else
            res.json(doc);
    });
});

// ---------------------------Display review in Dashboard--------------------------------- //

app.get("/api/dashboard/review/:number/:username", function (req, res) {
    var username = req.params.username;
    var index = ((req.params.number - 1) * 5);
    var limit = 5;
    var query = User.find({ 'username': username });
    query.sort({ comment: -1 });
    query.slice('comment', [index, 5]);
    query.exec(function (err, doc) {
        if (err)
            throw (err)
        else
            res.json(doc);
    });
})

// --------------------------- Display reviews in City --------------------------- //

app.get("/api/getreview/city/:cityId/:number", function (req, res) {
    console.log("getting review in server");
    var cityId = req.params.cityId;
    var index = ((req.params.number) * 10);
    console.log(cityId);
    var query = City.findOne({ 'cityID': cityId });
    query.exec(function (err, doc) {
        if (doc != null) {
            res.json(doc.comment);
        } else {
            console.log("no data");
        }
    });
});

// --------------------------- Follow/UnFollow user --------------------------- //

app.post("/api/follow", function (req, res) {
    var follow = req.body.follow;
    var follower = req.body.follower;
    var following = req.body.following;
    if (follow) {
        console.log("follow testing");
        User.findOneAndUpdate({ 'username': follower }, { $addToSet: { 'following': following } }, { safe: true, upsert: true }, function (err, doc) {
            if (err) {
                throw (err);
            }
        });
        User.findOneAndUpdate({ 'username': following }, { $addToSet: { 'followers': follower } }, { safe: true, upsert: true }, function (err, doc) {
            if (err) {
                throw (err);
            }
        });
    } else {
        User.findOneAndUpdate({ 'username': follower }, { $pull: { 'following': following } }, function (err, doc) {
            if (err)
                throw (err);
        });
        User.findOneAndUpdate({ 'username': following }, { $pull: { 'followers': follower } }, function (err, doc) {
            if (err)
                throw (err);
        });
    }

});

// --------------------------- Send Message ------------------------------- //

app.post("/api/sendMessage", auth, function (req, res) {
    var sender = req.body.sender;
    var receiver = req.body.receiver;
    var message = req.body.message;
    var newentry = new Message({
        sender: sender,
        receiver: receiver,
        message: message
    });

    newentry.save(function (err, data) {
        if (err) throw (err);
        else console.log('Saved message');
    });

});

// --------------------------- Retrieve Messages ------------------------------- //

app.get("/api/user/getmessage/:username", function (req, res) {

    var username = req.params.username;
    Message.find({ $or: [{ 'sender': username }, {'receiver': username}] }, function (err, doc) {
        if (doc) {
            res.json(doc);
        } else if (err) {
            throw (err);
        } else {
            console.log("no messages");
        }
    })

});

// ----------------- Retrieve all messages for a particular person --------------//

app.get("/api/allmessages/:loggedin/:otheruser", function (req, res) {
    var user = req.params.loggedin;
    var otheruser = req.params.otheruser;
    q1 = { $and: [{ 'sender': user }, { 'receiver': otheruser }]};
    q2 = { $and: [{ 'sender': otheruser }, { 'receiver': user }] };
    var query = Message.find({ $or: [q1, q2] });
    query.sort({ date: 'descending' });
    query.exec(function (err, docs) {
        if (err)
            throw (err);
        else
            res.json(docs);
    });
});

// ------------------------- Send Message for Message URL ---------------------- //

app.post("/api/messages/newMessage/", function (req, res) {
    var sender = req.body.sender;
    var receiver = req.body.receiver;
    var message = req.body.message;

    var newentry = new Message({
        sender: sender,
        receiver: receiver,
        message: message
    });

    newentry.save(function (err, data) {
        if (err) console.log(err);
        else {
            console.log('Saved message');
            res.json({ ok: "" });
        }
    });
});

// --------------------------- Upload Photo ------------------------------- //

app.post('/upload', function (req, res) {
    var user = req.body.username;
    var tmp_path = req.files.thumbnail.path;
    var img = fs.readFileSync(tmp_path, 'binary');
    User.findOneAndUpdate({ 'username': user }, { $set: { 'image': img } }, { safe: true, upsert: true }, function (err, doc) {
        if (err)
            throw (err);
        else {
            doc.save(function (err) {
                if (err)
                    throw (err);
            })
        }
        res.redirect("/#/profile/" + user + '');
    });
});

// --------------------------- Fetch User's Followers Photo ------------------------------- //

app.get("/api/getImages/followers/:username", function (req, res) {

    var user = req.params.username
    console.log(user);
    var followers = [];
    User.findOne({ 'username': user }, function (err, doc) {
        if (err)
            throw (err);
        else {
            followers = doc.followers;
            console.log(followers);
            User.find({ 'username': { $in: followers } }, function (err, docs) {
                if (err)
                    throw (err);
                else
                    res.json(docs);
            });
        }
    });
});

// --------------------------- Fetch User's Followers Photo ------------------------------- //

app.get("/api/getImages/following/:username", function (req, res) {

    var user = req.params.username
    console.log(user);
    var following = [];
    User.findOne({ 'username': user }, function (err, doc) {
        if (err)
            throw (err);
        else {
            following = doc.following;
            console.log(following);
            User.find({ 'username': { $in: following } }, function (err, docs) {
                if (err)
                    throw (err);
                else
                    res.json(docs);
            });
        }
    });
});

// --------------------------- Fetch Photo for MessageDeatails------------------------------- //

app.get("/api/getImage/messageDetail/:loggedInUser/:otherUser", function (req, res) {

    var loggedIn = req.params.loggedInUser;
    var user2 = req.params.otherUser;
    User.find({ 'username': { $in: [loggedIn, user2] } }, function (err, docs) {
        if (err)
            throw (err)
        else
            res.json(docs);
    });
});

// --------------------------- Fetch Photo for all Messages------------------------------- //

app.post("/api/message/user/images", function (req, res) {

    var arr = req.body.users;
    var users = [];
    for (var i in arr) {
        users.push(arr[i].user);
    }
    console.log(users);
    User.find({ 'username': { $in: users } }, function (err, docs) {
        if (err)
            throw (err)
        else
            res.json(docs);
    });
});

// --------------------------- Fetch User Photo ------------------------------- //

app.get('/api/getuserImage/:user', function (req, res) {

    var user = req.params.user;

    User.findOne({ 'username': user }, function (err, doc) {
        if (err)
            throw (err);
        else
            res.json(doc);
    });
});

// --------------------------- Fetch Photo for all Users who commented in a city ------------------------------- //

app.post('/api/getImages/allusers', function (req, res) {

    var imgarray = req.body.urls;
    var responseUrl = [];
    for (var i in imgarray) {
        var imgPath = imgarray[i].url;
        var img = fs.readFileSync(__dirname + "/travel/profile/" + imgPath, 'binary');
        responseUrl.push({ "image": img });
    }
    res.json(responseUrl);
});

// ----------------------------------------------------------------------------------------- //
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port, ip);

