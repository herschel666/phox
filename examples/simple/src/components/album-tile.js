import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import * as types from '../prop-types';

const AlbumTile = props => (
  <li>
    <style jsx>{`
      li {
        margin: 36px 0;
        list-style: none;
      }

      figure {
        margin: 0;
      }
    `}</style>
    <figure>
      <Link {...props.linkProps}>
        <a>
          <img src={props.src} alt={props.title} />
        </a>
      </Link>
      <figcaption>{props.title}</figcaption>
    </figure>
  </li>
);

AlbumTile.propTypes = {
  linkProps: types.linkProps.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default AlbumTile;
