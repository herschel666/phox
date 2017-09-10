import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import * as types from '../prop-types';

const FrontpageTile = props => (
  <li>
    <style jsx>{`
      li {
        margin: 9px;
        list-style: none;
        display: inline-block;
      }

      figure {
        margin: 0;
      }
    `}</style>
    <figure>
      <Link {...props.linkProps}>
        <a>
          <img src={props.banner} alt={`Album "${props.title}"`} />
        </a>
      </Link>
      <figcaption>
        <Link {...props.linkProps}>
          <a>{props.title}</a>
        </Link>
      </figcaption>
    </figure>
  </li>
);

FrontpageTile.propTypes = {
  linkProps: types.linkProps.isRequired,
  banner: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default FrontpageTile;
