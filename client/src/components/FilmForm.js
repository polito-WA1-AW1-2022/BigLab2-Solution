import dayjs from 'dayjs';
import React, {useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film } from '../models/Film';



const FilmForm = (props) => {

  /*
   * Creating a state for each parameter of the film.
   * There are two possible cases: 
   * - if we are creating a new film, the form is initialized with the default values.
   * - if we are editing a film, the form is pre-filled with the previous values.
   */
  const [title, setTitle] = useState(props.film ? props.film.title : '');
  const [favorite, setFavorite] = useState(props.film ? props.film.favorite : false);
  // It is preferable to avoid format conversions in the controlled form field, thus we use the date string format used in the DATA form control (YYYY-MM-DD) and convert to dayjs only after validation
  const [watchDate, setWatchDate] = useState(props.film ? (props.film.hasDate() ? props.film.watchDate.format('YYYY-MM-DD') : "") : dayjs().format('YYYY-MM-DD'));
  const [rating, setRating] = useState(props.film ? props.film.rating : 0);

  // useNavigate hook is necessary to change page
  const navigate = useNavigate();
  // useLocation hook is used to remember with filter was selected when we reached this form
  const location = useLocation();

  // if the film is saved (eventually modified) we return to the list of all films, 
  // otherwise, if cancel is pressed, we go back to the previous location (given by the location state)
  const nextpage = location.state?.nextpage || '/';

  const handleSubmit = (event) => {
    event.preventDefault();

    // String.trim() method is used for removing leading and ending whitespaces from the title.
    const film = new Film( {"title": title.trim(), favorite, rating, watchDate  } );

    // NOTE: an "all spaces" string in title gets validated by the HTML built-in "required" control, but becomes empty string with trim(), you may want to use something like pattern=".*\S+.*" 

    /* In this solution validations are executed through HTML parameters.
       To add also JavaScript validations, this is the right place for coding them! */

    if(props.film === undefined)
      props.addFilm(film);
    else {
      film.id = props.film.id;
      props.editFilm(film);
    }

    navigate('/');
  }


  return (
    <Form className="block-example border border-primary rounded mb-0 form-padding" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)}/>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check custom="true" type="checkbox" label="Favorite" name="favorite" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Watch Date</Form.Label>
        { 
        /* watchDate is an optional parameter. It have to be properly rendered only if available. */ 
        }
        <Form.Control type="date" value={watchDate} max={dayjs().format("YYYY-MM-DD")} onChange={(event) => setWatchDate(event.target.value)}/>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>
        <Form.Select aria-label="Rating" defaultValue={rating} onChange={event => setRating(event.target.value)}>
          { [...Array(6)].map( (v, i) => <option key={i} value={i}>{i}</option>) }
        </Form.Select>
      </Form.Group>

      <Button className="mb-3" variant="primary" type="submit">Save</Button>
      &nbsp;
      <Link to={nextpage}> 
        <Button className="mb-3" variant="danger" >Cancel</Button>
      </Link>
    </Form>
  )

}

export default FilmForm;
