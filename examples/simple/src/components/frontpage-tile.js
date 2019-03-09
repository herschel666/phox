import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import * as types from '../prop-types';

const FrontpageTile = ({ title, banner, linkProps }) => {
  const { href, as } = linkProps;

  return (
    <li>
      <style jsx>
        {`
          li {
            margin: 9px;
            list-style: none;
            display: inline-block;
          }

          figure {
            margin: 0;
          }
        `}
      </style>
      <figure>
        <Link href={href} as={as}>
          <a>
            <img src={banner} alt={`Album "${title}"`} />
          </a>
        </Link>
        <figcaption>
          <Link href={href} as={as}>
            <a>{title}</a>
          </Link>
        </figcaption>
      </figure>
    </li>
  );
};

FrontpageTile.propTypes = {
  linkProps: types.linkProps.isRequired,
  banner: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default FrontpageTile;
