import React from 'react';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';
import * as types from '../prop-types';

// eslint-disable react/no-danger
const Index = ({ content, albums }) => (
  <Frame title="Simple example :: phox" headline={content.meta.title}>
    <div dangerouslySetInnerHTML={{ __html: content.body }} />
    <hr />
    <ul>
      {albums.map(({ title, linkProps }) => (
        <li key={title}>
          <Link {...linkProps}>
            <a>{title}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Frame>
);
// eslint-enable react/no-danger

Index.getInitialProps = async ({ req }) => {
  // Only use complete URL on the server-side
  const host = req ? `http://${hostname}:${port}` : '';
  const res = await fetch(`${host}/data/index.json`);
  return res.json();
};

Index.propTypes = {
  albums: PropTypes.arrayOf(types.linkProps).isRequired,
  content: types.page.isRequired,
};

export default Index;
