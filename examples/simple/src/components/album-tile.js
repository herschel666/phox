import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import * as types from '../prop-types';

const AlbumTile = ({ linkProps, src, title, width, height }) => {
  const ratio = height / width;
  return (
    <li>
      <style jsx>{`
        li {
          margin: 36px 0;
          list-style: none;
        }

        figure {
          margin: 0;
        }

        a {
          display: block;
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 0;
        }

        img {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
      `}</style>
      <figure>
        <Link {...linkProps}>
          <a
            style={{
              paddingTop: `${(ratio * 100).toFixed(6)}%`,
            }}
          >
            <img src={src} alt={title} />
          </a>
        </Link>
        <figcaption>{title}</figcaption>
      </figure>
    </li>
  );
};

AlbumTile.propTypes = {
  linkProps: types.linkProps.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default AlbumTile;
