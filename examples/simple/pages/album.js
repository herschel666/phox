import React from 'react';
import path from 'path';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';
import * as types from '../prop-types';

// eslint-disable react/no-danger
const Album = ({ content, images }) => (
  <Frame title={`${content.meta.title} :: phox`} headline={content.meta.title}>
    &laquo;{' '}
    <Link href="/">
      <a>Home</a>
    </Link>
    <hr />
    <div dangerouslySetInnerHTML={{ __html: content.body }} />
    <ul>
      {images.map(({ filePath, detailLinkProps, meta }) => (
        <li key={filePath}>
          <figure>
            <Link {...detailLinkProps}>
              <a>
                <img
                  src={`/${filePath}`}
                  alt={meta.object_name}
                  style={{ maxWidth: '100%' }}
                />
              </a>
            </Link>
            <figcaption>{meta.object_name}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  </Frame>
);
// eslint-enable react/no-danger

Album.getInitialProps = async ({ query, req }) => {
  // Only use complete URL on the server-side
  const host = req ? `http://${hostname}:${port}` : '';
  const { album } = query;
  const res = await fetch(`${host}/${path.join('data/albums', album)}.json`);
  return res.json();
};

Album.propTypes = {
  content: types.page.isRequired,
  images: PropTypes.arrayOf(types.image).isRequired,
};

export default Album;
