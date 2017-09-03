import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';

const getDefaultLink = page => ({
  href: {
    pathname: '/default',
    query: { page },
  },
  as: { pathname: `/${page}/` },
});

const Frame = ({ title, children, description }) => (
  <div>
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Head>
    <div>
      {children}
      <hr />
      <p>
        &copy; {new Date().getFullYear()}
        &nbsp;&middot;&nbsp;
        <a href="https://npm.im/phox" target="_blank">
          Built with phox
        </a>&nbsp;🦊 &nbsp;&middot;&nbsp; [<Link {...getDefaultLink('about')}>
          <a>About</a>
        </Link>] &middot; [<Link {...getDefaultLink('contact')}>
          <a>Contact</a>
        </Link>]
      </p>
    </div>
  </div>
);

Frame.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Frame;
