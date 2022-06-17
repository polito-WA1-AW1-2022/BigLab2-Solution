# BigLab 2 - Class: 2022 [AW1/WA1-AJ/WA1-KZ]

## Team name: TEAM_NAME

Team members:

* s123456 Mannella Luca
* s123457 Sáenz Moreno Juan Pablo
* s123458 Servetti Antonio

## Instructions

A general description of the BigLab 2 is avaible in the `course-materials` repository, [under _labs_](https://polito-wa1-aw1-2022.github.io/materials/labs/BigLab2/BigLab2.pdf). In the same repository, you can find the [instructions for GitHub Classroom](https://polito-wa1-aw1-2022.github.io/materials/labs/GH-Classroom-BigLab-Instructions.pdf), covering BigLabs and exam sessions.

Once you cloned this repository, please write the group name and names of the members of the group in the above section.

In the `client` directory, do **NOT** create a new folder for the project, i.e., `client` should directly contain the `public` and `src` folders and the `package.json` files coming from BigLab1.

When committing on this repository, please, do **NOT** commit the `node_modules` directory, so that it is not pushed to GitHub.
This should be already automatically excluded from the `.gitignore` file, but double-check.

When another member of the team pulls the updated project from the repository, remember to run `npm install` in the project directory to recreate all the Node.js dependencies locally, in the `node_modules` folder.
Remember that `npm install` should be executed inside the `client` and `server` folders (not in the `BigLab2` root directory).

Finally, remember to add the `final` tag for the final submission, otherwise it will not be graded.

## Registered Users

Here you can find a list of the users already registered inside the provided database. This information will be used during the fourth week, when you will have to deal with authentication.
If you decide to add additional users, please remember to add them to this table (with **plain-text password**)!

| email | password | name |
|-------|----------|------|
| john.doe@polito.it | password | John |
| mario.rossi@polito.it | password | Mario |
| testuser@polito.it | password | Testuser |

## List of APIs offered by the server

Provide a short description for API with the required parameters, follow the proposed structure.

* [HTTP Method] [URL, with any parameter]
* [One-line about what this API is doing]
* [Sample request, with body (if any)]
* [Sample response, with body (if any)]
* [Error responses, if any]

### Film Management


#### Get all films

* HTTP method: `GET`  URL: `/api/films`
* Description: Get the full list of films or the films that match the query filter parameter, and belong to the logged user
* Request body: _None_
* Request query parameter: _filter_ name of the filter to apply (filter-all, filter-favorite, filter-best, filter-lastmonth, filter-unseen)
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film:

``` json
[
  {
    "id": 1,
    "title": "Pulp Fiction",
    "favorite": 1,
    "watchDate": "2022-03-11",
    "rating": 5,
    "user": 1
  },
  {
    "id": 2,
    "title": "21 Grams",
    "favorite": 1,
    "watchDate": "2022-03-17",
    "rating": 4,
    "user": 1
  },
  ...
]
```

* Error responses:  `500 Internal Server Error` (generic error)

#### Get film by id

* HTTP method: `GET`  URL: `/api/films/:id`
* Description: Get the film corresponding to the id (if it belongs to the current logged user)
* Request body: _None_
* Response: `200 OK` (success)
* Response body: One object describing the required film:

``` JSON
[
  {
    "id": 2,
    "title": "21 Grams",
    "favorite": 1,
    "watchDate": "2022-03-17",
    "rating": 4,
    "user": 1
  }
]
```

* Error responses:  `500 Internal Server Error` (generic error), `404 Not Found` (not present or unavailable)



#### Add a new film

* HTTP method: `POST`  URL: `/api/films`
* Description: Add a new film to the films of the logged user
* Request body: description of the object to add (user propery, if present, is ignored and substituted with the id of the logged user, film id value is not required and is ignored)

``` JSON
{
    "id": 2,
    "title": "21 Grams",
    "favorite": 1,
    "watchDate": "2022-03-17",
    "rating": 4,
    "user": 1
}
```

* Response: `200 OK` (success)
* Response body: the object as represented in the database

* Error responses:  `422 Unprocessable Entity` (values do not satisfy validators), `503 Service Unavailable` (database error)

#### Update an existing film

* HTTP method: `PUT`  URL: `/api/films/:id`
* Description: Update values of an existing film (except the id) of the logged user
* Request body: description of the object to update

``` JSON
{
    "id": 2,
    "title": "21 Grams",
    "favorite": 1,
    "watchDate": "2022-03-17",
    "rating": 4,
    "user": 1
}
```

* Response: `200 OK` (success)
* Response body: the object as represented in the database

* Error responses:  `422 Unprocessable Entity` (values do not satisfy validators), `503 Service Unavailable` (database error)


#### Delete an existing film

* HTTP method: `DELETE`  URL: `/api/films/:id`
* Description: Delete an existing film of the logged user
* Request body: _None_

* Response: `200 OK` (success)
* Response body: an empty object

* Error responses:  `503 Service Unavailable` (database error)


#### Update favorite property of an existing film (not required)

* HTTP method: `PUT`  URL: `/api/films/:id/favorite`
* Description: Update favorite property value of an existing film of the logged user
* Request body: value of the favorite property

``` JSON
{
    "id": 2,
    "favorite": 1,
}
```

* Response: `200 OK` (success)
* Response body: the object as represented in the database

* Error responses:  `422 Unprocessable Entity` (values do not satisfy validators), `503 Service Unavailable` (database error)


#### Get filter list (not required)

* HTTP method: `GET`  URL: `/api/filters`
* Description: Get the object that describes the filters
* Request body: _None_
* Response: `200 OK` (success)
* Response body: An object with ids of the filters as key

```JSON
{
  "filter-all": {
    "label": "All",
    "id": "filter-all"
  },
  "filter-favorite": {
    "label": "Favorites",
    "id": "filter-favorite"
  },
  "filter-best": {
    "label": "Best Rated",
    "id": "filter-best"
  },
  "filter-lastmonth": {
    "label": "Seen Last Month",
    "id": "filter-lastmonth"
  },
  "filter-unseen": {
    "label": "Unseen",
    "id": "filter-unseen"
  }
}
```

### User management

#### Login

* HTTP method: `POST`  URL: `/api/sessions`
* Description: authenticate the user who is trying to login
* Request body: credentials of the user who is trying to login

``` JSON
{
    "username": "username",
    "password": "password"
}
```

* Response: `200 OK` (success)
* Response body: authenticated user

``` JSON
{
    "id": 1,
    "username": "john.doe@polito.it", 
    "name": "John"
}
```
* Error responses:  `500 Internal Server Error` (generic error), `401 Unauthorized User` (login failed)


#### Check if user is logged in

* HTTP method: `GET`  URL: `/api/sessions/current`
* Description: check if current user is logged in and get her data
* Request body: _None_
* Response: `200 OK` (success)

* Response body: authenticated user

``` JSON
{
    "id": 1,
    "username": "john.doe@polito.it", 
    "name": "John"
}
```

* Error responses:  `500 Internal Server Error` (generic error), `401 Unauthorized User` (user is not logged in)


#### Logout

* HTTP method: `DELETE`  URL: `/api/sessions/current`
* Description: logout current user
* Request body: _None_
* Response: `200 OK` (success)

* Response body: _None_

* Error responses:  `500 Internal Server Error` (generic error), `401 Unauthorized User` (user is not logged in)