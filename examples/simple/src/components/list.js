import React from 'react';
import PropTypes from 'prop-types';

const List = ({ children }) => (
  <ul>
    <style jsx>
      {`
        ul {
          padding: 36px 0 0 0;
          margin: 36px 0;
          border-top: 1px solid #444;
          list-style: none;
        }
      `}
    </style>
    {children}
  </ul>
);

List.propTypes = { children: PropTypes.arrayOf(PropTypes.node).isRequired };

export default List;
