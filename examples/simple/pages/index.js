import React from 'react';
import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import Frame from '../src/components/frame';
import List from '../src/components/list';
import FrontpageTile from '../src/components/frontpage-tile';
import { hostname, port } from '../phox.config';
import * as types from '../src/prop-types';

// eslint-disable react/no-danger
const Index = ({ content, albums }) => (
  <Frame title="Simple example :: phox" headline={content.meta.title}>
    <div dangerouslySetInnerHTML={{ __html: content.body }} />
    <List>
      {albums.map(({ meta, linkProps }) => (
        <FrontpageTile
          key={meta.name}
          linkProps={linkProps}
          title={meta.title}
          banner={meta.banner}
        />
      ))}
    </List>
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
  albums: PropTypes.arrayOf(
    PropTypes.shape({
      meta: PropTypes.object.isRequired,
      linkProps: types.linkProps.isRequired,
    })
  ).isRequired,
  content: types.page.isRequired,
};

export default Index;
