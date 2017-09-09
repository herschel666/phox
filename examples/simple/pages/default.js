import React from 'react';
import path from 'path';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';

// eslint-disable react/no-danger
const Default = ({ meta, body }) => (
  <Frame
    title={`${meta.title} :: phox`}
    description={meta.description}
    headline={meta.title}
  >
    <p dangerouslySetInnerHTML={{ __html: body }} />
    <hr />
    <Link href="/">
      <a>« Home</a>
    </Link>
  </Frame>
);
// eslint-enable react/no-danger

Default.getInitialProps = async ({ query, req }) => {
  // Only use complete URL on the server-side
  const host = req ? `http://${hostname}:${port}` : '';
  const { page } = query;
  const url = `${host}/${path.join('data', page)}.json`;
  const res = await fetch(url);
  return res.json();
};

Default.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  meta: PropTypes.object.isRequired,
  body: PropTypes.string.isRequired,
};

export default Default;
