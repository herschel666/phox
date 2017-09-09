import React from 'react';
import path from 'path';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';
import * as types from '../prop-types';

const titleWithFallback = title => title || 'No title';

// eslint-disable react/no-danger
const Image = ({ image, back, next, prev }) => (
  <Frame
    title={`Photo "${titleWithFallback(image.meta.title)}" :: phox`}
    headline={titleWithFallback(image.meta.title)}
  >
    {prev ? (
      <Link {...prev.linkProps}>
        <a>{`« ${titleWithFallback(prev.title)} `}</a>
      </Link>
    ) : (
      '_ '
    )}
    |
    <Link {...back.linkProps}>
      <a style={{ padding: '0 1em' }}>{`Back to album "${back.title}"`}</a>
    </Link>
    |
    {next ? (
      <Link {...next.linkProps}>
        <a>{` ${titleWithFallback(next.title)} »`}</a>
      </Link>
    ) : (
      ' _'
    )}
    <hr />
    <img
      src={`/${image.filePath}`}
      alt={image.meta.title}
      style={{ maxWidth: '100%' }}
    />
    {image.meta.description && (
      <div>
        <hr />
        <div dangerouslySetInnerHTML={{ __html: image.meta.description }} />
      </div>
    )}
  </Frame>
);
// eslint-enable react/no-danger

Image.getInitialProps = async ({ query, req }) => {
  // Only use complete URL on the server-side
  const host = req ? `http://${hostname}:${port}` : '';
  const { album, image } = query;
  const res = await fetch(
    `${host}/${path.join('data/albums', album, image)}.json`
  );
  return res.json();
};

Image.propTypes = {
  image: types.image.isRequired,
  back: types.pageRef.isRequired,
  next: types.pageRef.isRequired,
  prev: types.pageRef.isRequired,
};

export default Image;
