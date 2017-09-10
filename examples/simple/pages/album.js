import React from 'react';
import path from 'path';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import Frame from '../src/components/frame';
import List from '../src/components/list';
import HomeLink from '../src/components/home-link';
import AlbumTile from '../src/components/album-tile';
import { hostname, port } from '../phox.config';
import * as types from '../src/prop-types';

// eslint-disable react/no-danger
const Album = ({ content, images }) => (
  <Frame title={`${content.meta.title} :: phox`} headline={content.meta.title}>
    <HomeLink />
    <div dangerouslySetInnerHTML={{ __html: content.body }} />
    <List>
      {images.map(({ filePath, detailLinkProps, meta }) => (
        <AlbumTile
          key={filePath}
          linkProps={detailLinkProps}
          src={`/${filePath}`}
          title={meta.title}
        />
      ))}
    </List>
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
