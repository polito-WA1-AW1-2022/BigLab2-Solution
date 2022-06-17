import React from 'react';
import { ListGroup } from 'react-bootstrap/';
import { NavLink } from 'react-router-dom';

/**
 * Component used for BigLab 1D
 * 
 * This components requires:
 * - the list of filters labels to show, 
 * - the filter that is currenctly selected 
 * - the handler to notify a new selection
 */
const RouteFilters = (props) => {
  const { items, selected } = props;

  // Converting the object into an array to use map method
  const filterArray = Object.entries(items);

  return (
    <ListGroup as="ul" variant="flush">
      {
        filterArray.map(([filterName, { label }]) => {
          return (
            <NavLink key={filterName} to={`/filter/${filterName}`} style={{ textDecoration: 'none' }}>
              <ListGroup.Item as="li" key={filterName} 
                action active={selected === filterName} >
                {label}
              </ListGroup.Item>
            </NavLink>
          );
        })
      }
    </ListGroup>
  )
}

export { RouteFilters };

