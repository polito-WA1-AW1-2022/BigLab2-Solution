# Film Library with React (client-side)

BigLab01 of the Applicazioni Web I / Web Applications I (2021/2022) classes at Politecnico di Torino.

The application contains:

* a navigation bar (with a logo, a (unused) search box, and a user icon)
* a sidebar with the filters (i.e., Favorite, Best Rated, Seen Last Month, Unseen), 
* the main content (i.e., the list of films),
* a “+” button for adding new films.

Each film is displayed in the following manner:

*	The title of the Film. The title of the favorite films should be displayed in red. 
*	A checkbox to show and set whether the Film is a favorite (_checked_) or not (_unchecked_). 
*	The Film's watch date in the format "Month D, Yr" (e.g., "March 24, 2022"), if any. 
*	The rating of the Film is expressed between one and five stars. If the score is not assigned, five empty stars are visualized. If the score is three out of five, the GUI should display three filled stars and two empty stars.

User actions:

* in the main view, for each film, the user is given the possibility to open the film details form for update or, directly in the main view, delete a given film, change its rating or mark it as favorite/unfavorite,
* in the sidebar, each filter reloads the main view showing only the films that match the selected filter,
* with the "+" button a form is shown to insert the film details and add it to the film list.

