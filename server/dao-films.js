'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('./db');
const dayjs = require("dayjs");

const filters = {
  'filter-all':       { label: 'All', id: 'filter-all', filterFn: () => true}, 
  'filter-favorite':  { label: 'Favorites', id: 'filter-favorite', filterFn: film => film.favorite}, 
  'filter-best':      { label: 'Best Rated', id: 'filter-best', filterFn: film => film.rating >= 5}, 
  'filter-lastmonth': { label: 'Seen Last Month', id: 'filter-lastmonth', filterFn: film => isSeenLastMonth(film)}, 
  'filter-unseen':    { label: 'Unseen', id: 'filter-unseen', filterFn: film => film.watchDate.isValid()  ? false : true }
};


const isSeenLastMonth = (film) => {
  if (film.watchDate == null || typeof film.watchDate.diff !== 'function')
    return false;
  return film.watchDate.diff(dayjs(), 'month') === 0;
};

/** WARNING: 
 * all DB operations must check that the films belong to the loggedIn user, 
 * thus include a WHERE user=? check !!!
 */ 

/** NOTE
 * return error messages as json object { error: <string> }
 */

// This function returns the filters object.
exports.listFilters = () => {
  return filters;
}

// This function retrieves the whole list of films from the database.
exports.listFilms = (user, filter) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM films WHERE user=?';
      db.all(sql, [user], (err, rows) => {
        if (err) { reject(err); return; }

        const films = rows.map((e) => {
          // WARN: the database returns only lowercase fields. So, to be compliant with the client-side, we convert "watchdate" to the camelCase version ("watchDate").
          const film = Object.assign({}, e, { watchDate: dayjs(e.watchdate) });  // adding camelcase "watchDate"
          delete film.watchdate;  // removing lowercase "watchdate"
          return film;
        });

        // WARN: if implemented as if(filters[filter]) returns true also for filter = 'constructor' but then .filterFn does not exists
        if (filters.hasOwnProperty(filter)) 
          resolve(films.filter(filters[filter].filterFn));
        else resolve(films);
      });
    });
};
  
// This function retrieves a film given its id and the associated user id.
exports.getFilm = (user, id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM films WHERE id=? and user=?';
      db.get(sql, [id, user], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row == undefined) {
          resolve({ error: 'Film not found.' });
        } else {
          // WARN: database is case insensitive. Converting "watchDate" to camel case format
          const film = Object.assign({}, row, { watchDate: row.watchdate } );  // adding camelcase "watchDate"
          delete film.watchdate;  // removing lowercase "watchdate"
          resolve(film);
        }
      });
    });
};
  
  
/**
 * This function adds a new film in the database.
 * The film id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.createFilm = (film) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO films (title, favorite, watchDate, rating, user) VALUES(?, ?, ?, ?, ?)';
      db.run(sql, [film.title, film.favorite, film.watchDate, film.rating, film.user], function (err) {
        if (err) {
          reject(err);
          return;
        }
        // Returning the newly created object with the DB additional properties to the client.
        resolve(exports.getFilm(film.user, this.lastID));
      });
    });
};
  
// This function updates an existing film given its id and the new properties.
exports.updateFilm = (user, id, film) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE films SET title = ?, favorite = ?, watchDate = ?, rating = ? WHERE id = ? and user = ?';
      db.run(sql, [film.title, film.favorite, film.watchDate, film.rating, id, user], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(exports.getFilm(film.user, id)); 
      });
    });
};
  
// This function deletes an existing film given its id.
exports.deleteFilm = (user, id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM films WHERE id = ? and user = ?';
      db.run(sql, [id, user], (err) => {
        if (err) {
          reject(err);
          return;
        } else
          resolve(null);
      });
    });
}
