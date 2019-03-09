import React from 'react';
import PropTypes from 'prop-types';
import { MAX_WIDTH, BREAKPOINT_MEDIUM } from '../constants';

const Header = ({ headline }) => (
  <header>
    <style jsx>
      {`
        header {
          padding: 18px 0;
          background-color: #444;
          color: #f4f4f4;
          border-bottom: 2px solid #343434;
        }

        h1 {
          max-width: ${MAX_WIDTH};
          margin: 0 18px;
          font-weight: normal;
          font-size: 24px;
        }

        @media screen and (min-width: ${BREAKPOINT_MEDIUM}) {
          h1 {
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}
    </style>
    <h1>{headline}</h1>
  </header>
);

Header.propTypes = { headline: PropTypes.string.isRequired };

export default Header;
