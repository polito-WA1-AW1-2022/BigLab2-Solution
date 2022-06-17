const dayjs = require('dayjs');

/**
 * Constructor function for new Film objects
 * @param {string} id unique ID of the film (e.g., '1')
 * @param {string} title the title of the movie
 * @param {boolean} favorite it the movie is among favorite or not
 * @param {string} watchDate when the movie was watched, in a format parseable by dayjs()
 * @param {number} rating the rating assigned to the movie
 * @param {number} user the id of the user who belong the movie
*/
function Film({ id, title, favorite, watchDate, rating, user } = {}) {
    this.id = id;
    this.title = title;
    this.favorite = favorite;
    this.watchDate = dayjs(watchDate);
    // Used to serialize the date only with day information as YYYY-MM-DD
    this.watchDate.toJSON = function () { return this.isValid() ? this.format('YYYY-MM-DD') : "" ; }
    this.rating = rating;
    this.user = user;

    this.hasDate = () => this.watchDate.isValid();

}

export { Film }