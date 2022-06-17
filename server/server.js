/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { check, validationResult, body, param } = require('express-validator'); // validation middleware

const filmDao = require('./dao-films'); // module for accessing the films table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB
// const buildFilm = require('./Film') // module for accessing film constructor function

/** Authentication-related imports **/
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');


/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/**
 * The "delay" middleware introduces some delay in server responses. To change the delay change the value of "delayTime" (specified in milliseconds).
 * This middleware could be useful for debug purposes, to enabling it uncomment the following lines.
 */ 
// const delayTime = 1000;
// const delay = require('express-delay');
// app.use(delay(delayTime));


/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

// Set up local strategy to verify, search in the DB a user with a matching password, and retrieve its information by userDao.getUser (i.e., id, username, name).
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return cb(null, false, 'Incorrect username or password');  
    
  return cb(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, cb) { // this user is id + username + name 
  cb(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, cb) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => cb(null, user)).catch(err => cb(err, null));

  return cb(null, user); // this will be available in req.user
});

// Creating the session
app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/*** Defining authentication verification middleware ***/

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user); // WARN: returns 200 even if .status(200) is missing?
      });
  })(req, res, next);
});


/*
// POST /api/sessions 
// This is an alternative logind route. It performs login without sending back an error message.
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  res.status(201).json(req.user);
});
*/

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


// GET /api/filters
// This route returns the list of filters (only "labels" and "ids").
app.get('/api/filters', 
(req, res) => {
  // When the "filters" object is serialized through this method, filter functions are not serialized.
  res.json(filmDao.listFilters())
});

/*** Films APIs ***/

// GET /api/films
// This route returns the FilmLibrary. It handles also "filter=?" query parameter
app.get('/api/films', 
isLoggedIn,               // check: is the user logged-in?
(req, res) => {
  // NOTE: user exists for sure otherwise isLoggedIn would fail
  // get films that match optional filter in the query
  filmDao.listFilms(req.user.id, req.query.filter)
    // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
    .then(films => res.json(films))
    .catch((err) => res.status(500).json(err)); // always return a json and an error message
});

// GET /api/films/<id>
// Given a film id, this route returns the associated film from the library.
app.get('/api/films/:id', 
isLoggedIn,                 // check: is the user logged-in?
[ check('id').isInt() ],    // check: validation
async (req, res) => {
    try {
      const result = await filmDao.getFilm(req.user.id, req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        // NOTE: "invalid dates" (i.e., missing dates) are set to null during JSON serialization
        res.json(result);
    } catch (err) {
      res.status(500).end();
    }
});


// POST /api/films
// This route adds a new film to film library.
app.post('/api/films',
isLoggedIn,
[
  check('title').isLength({ min: 1, max:160 }),
  check('favorite').isBoolean(),
  // only date (first ten chars) and valid ISO
  check('watchDate').isLength({min: 10, max: 10}).isISO8601({ strict: true }).optional({ checkFalsy: true }).not().isAfter(),
  check('rating').isInt({ min: 0, max: 5 }),
], 
async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ")  }); // error message is a single string with all error joined together
  }

  // WARN: note that we expect watchDate with capital D but the databases does not care and uses lowercase letters, so it returns "watchdate"

  const film = {
    title: req.body.title,
    favorite: req.body.favorite,
    watchDate: req.body.watchDate, // A different method is required if also time is present. For instance: (req.body.watchDate || '').split('T')[0]
    rating: req.body.rating,
    user: req.user.id  // user is overwritten with the id of the user that is doing the request and it is logged in
  };  

  try {
    const result = await filmDao.createFilm(film); // NOTE: createFilm returns the new created object
    res.json(result); 
  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of new film: ${err}` }); 
  }
});

// PUT /api/films/<id>
// This route allows to modify a film, specifiying its id and the necessary data.
app.put('/api/films/:id', 
isLoggedIn,
  [
    check(['id']).isInt(),  
    check('title').isLength({ min: 1, max:160 }),
    check('favorite').isBoolean(),
    // only date (first ten chars) and valid ISO 
    check('watchDate').isLength({min: 10, max: 10}).isISO8601({ strict: true }).optional({ checkFalsy: true }),
    check('rating').isInt({ min: 0, max: 5 }),
  ], 
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ")  }); // error message is a single string with all error joined together
    }
  

  if (req.body.id !== Number(req.params.id)) {  // Check if url and body id mismatch
    return res.status(422).json({ error: 'URL and body id mismatch' });
  }

  const film = {
    id: req.body.id,
    title: req.body.title,
    favorite: req.body.favorite,
    watchDate: req.body.watchDate,
    rating: req.body.rating,
    user: req.user.id // user is overwritten with the id of the user that is doing the request and it is logged in
  };
  

  try {
    const result = await filmDao.updateFilm(req.user.id, film.id, film);
    res.json(result); 
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of film ${req.params.id}: ${err}` });
  }

});

// PUT /api/films/<id>/favorite 
// This route changes only the favorite value. It could also be a PATCH.
app.put('/api/films/:id/favorite', 
isLoggedIn,
  [
    check(['id']).isInt(),  
    check('favorite').isBoolean(),
  ], 
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ")  }); // error message is a single string with all error joined together
    }

  if (req.body.id !== Number(req.params.id)) {  // Check if url and body id mismatch
    return res.status(422).json({ error: 'URL and body id mismatch' });
  }

  try {
    const film = await filmDao.getFilm(req.user.id, req.params.id);
    if (film.error)
      return res.status(404).json(film);
    film.favorite = req.body.favorite;  // update favorite property
    const result = await filmDao.updateFilm(req.user.id, film.id, film);
    return res.json(result); 
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of film ${req.params.id}` });
  }

});

// DELETE /api/films/<id>
// Given a film id, this route deletes the associated film from the library.
app.delete('/api/films/:id', 
isLoggedIn,
  [ check('id').isInt() ], 
  async (req, res) => {
  try {
    // NOTE: if there is no film with the specified id, the delete operation is considered successful.
    await filmDao.deleteFilm(req.user.id, req.params.id);
    res.status(200).json({}); 
  } catch (err) {
    res.status(503).json({ error: `Database error during the deletion of film ${req.params.id}: ${err} ` });
  }
});


// Activating the server
const PORT = 3001;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));
