import React from 'react';
import Link from 'next/link';
import {
  MAX_WIDTH,
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  HIGHLIGHT_COLOR,
} from '../constants';

const year = new Date().getFullYear();

const getDefaultLink = (page) => ({
  href: {
    pathname: '/default',
    query: { page },
  },
  as: { pathname: `/${page}/` },
});

export default () => (
  <footer>
    <style jsx>
      {`
        footer {
          background-color: ${HIGHLIGHT_COLOR};
          font-size: 16px;
        }

        .inner {
          max-width: ${MAX_WIDTH};
          padding: 16px 0;
          margin: 0 18px;
        }

        a {
          color: white;
        }

        nav {
          display: block;
          margin-top: 18px;
        }

        .item,
        nav a {
          display: inline-block;
          margin-right: 16px;
        }

        .item {
          color: black;
        }

        .fox {
          padding-left: 8px;
          user-select: none;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));
        }

        @media screen and (min-width: ${BREAKPOINT_SMALL}) {
          nav {
            display: inline-block;
            margin-top: 0;
          }
        }

        @media screen and (min-width: ${BREAKPOINT_MEDIUM}) {
          .inner {
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}
    </style>
    <div className="inner">
      <span className="item">
        &copy;
        {year}
      </span>
      <span className="item">
        <a href="https://npm.im/phox" target="_blank" rel="noopener noreferrer">
          Built with phox
        </a>
        &nbsp;
        <span aria-label="Fox emoji" role="img" className="fox">
          🦊
        </span>
      </span>
      <nav>
        <Link {...getDefaultLink('about')}>
          <a>About</a>
        </Link>
        <Link {...getDefaultLink('contact')}>
          <a>Contact</a>
        </Link>
      </nav>
    </div>
  </footer>
);
