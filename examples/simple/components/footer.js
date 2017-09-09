import React from 'react';
import Link from 'next/link';
import { HIGHLIGHT_COLOR } from '../constants';

const year = new Date().getFullYear();

const getDefaultLink = page => ({
  href: {
    pathname: '/default',
    query: { page },
  },
  as: { pathname: `/${page}/` },
});

export default () => (
  <footer>
    <style jsx>{`
      footer {
        padding: 16px 18px;
        background-color: ${HIGHLIGHT_COLOR};
        font-size: 16px;
      }

      a {
        color: white;
      }

      nav {
        display: inline-block;
      }

      span,
      nav a {
        display: inline-block;
        margin-right: 16px;
      }

      span {
        color: black;
      }

      b {
        padding-left: 8px;
        user-select: none;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));
      }
    `}</style>
    <span>&copy; {year}</span>
    <span>
      <a href="https://npm.im/phox" target="_blank">
        Built with phox
      </a>&nbsp;<b>🦊</b>
    </span>
    <nav>
      <Link {...getDefaultLink('about')}>
        <a>About</a>
      </Link>
      <Link {...getDefaultLink('contact')}>
        <a>Contact</a>
      </Link>
    </nav>
  </footer>
);
