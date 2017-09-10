import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import * as types from '../prop-types';
import { titleWithFallback } from '../util';

const itemType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  linkProps: types.linkProps.isRequired,
});

const ImageNav = ({ back, prev, next }) => (
  <div>
    <style jsx>{`
      .back {
        display: block;
        margin-bottom: 18px;
        text-align: center;
      }

      .prev-next {
        display: flex;
        justify-content: space-between;
      }

      b {
        font-weight: normal;
      }

      .prev b::before {
        content: '«';
        padding-right: 4px;
      }

      .next {
        text-align: right;
      }

      .next b::after {
        content: '»';
        padding-left: 4px;
      }
    `}</style>
    <nav>
      <span className="back">
        <Link {...back.linkProps}>
          <a>{`Back to album "${back.title}"`}</a>
        </Link>
      </span>
      <span className="prev-next">
        <span className="prev">
          {prev && (
            <b>
              <Link {...prev.linkProps}>
                <a>{titleWithFallback(prev.title)}</a>
              </Link>
            </b>
          )}
        </span>
        <span className="next">
          {next && (
            <b>
              <Link {...next.linkProps}>
                <a>{titleWithFallback(next.title)}</a>
              </Link>
            </b>
          )}
        </span>
      </span>
    </nav>
  </div>
);

ImageNav.defaultProps = {
  prev: null,
  next: null,
};

ImageNav.propTypes = {
  back: itemType.isRequired,
  prev: itemType,
  next: itemType,
};

export default ImageNav;
