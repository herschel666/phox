import React from 'react';
import PropTypes from 'prop-types';

const Header = ({ headline }) => (
  <header>
    <style jsx>{`
      header {
        padding: 18px;
        background-color: #444;
        color: #f4f4f4;
        border-bottom: 2px solid #343434;
      }
      h1 {
        margin: 0;
        font-weight: normal;
        font-size: 24px;
      }
    `}</style>
    <h1>{headline}</h1>
  </header>
);

Header.propTypes = {
  headline: PropTypes.string.isRequired,
};

export default Header;
