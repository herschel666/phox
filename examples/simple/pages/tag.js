import React from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import fetch from 'isomorphic-fetch';
import Frame from '../src/components/frame';
import List from '../src/components/list';
import HomeLink from '../src/components/home-link';
import AlbumTile from '../src/components/album-tile';
import { hostname, port } from '../phox.config';
import * as types from '../src/prop-types';

const Tag = ({ images, title }) => (
  <Frame
    title={`Photos for "${title}" :: phox`}
    headline={`Photos for "${title}"`}
  >
    <HomeLink />
    <List>
      {images.map(({ filePath, detailLinkProps, meta }) => (
        <AlbumTile
          key={filePath}
          linkProps={detailLinkProps}
          src={`/${filePath}`}
          title={meta.title}
          width={meta.width}
          height={meta.height}
        />
      ))}
    </List>
  </Frame>
);

Tag.getInitialProps = async ({ query, req }) => {
  // Only use complete URL on the server-side
  const host = req ? `http://${hostname}:${port}` : '';
  const { tag } = query;
  const res = await fetch(`${host}/${path.join('data/tag', tag)}.json`);
  return res.json();
};

Tag.propTypes = {
  images: PropTypes.arrayOf(types.image).isRequired,
  title: PropTypes.string.isRequired,
};

export default Tag;
