import React from 'react';
import path from 'path';
import fetch from 'isomorphic-fetch';
import Frame from '../src/components/frame';
import ImageNav from '../src/components/image-nav';
import { hostname, port } from '../phox.config';
import * as types from '../src/prop-types';
import { titleWithFallback } from '../src/util';

// eslint-disable react/no-danger
const Image = ({ image, back, next, prev }) => (
  <Frame
    title={`Photo "${titleWithFallback(image.meta.title)}" :: phox`}
    headline={titleWithFallback(image.meta.title)}
  >
    <style jsx>{`
      figure {
        margin: 36px 0 0 0;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    `}</style>
    <ImageNav {...{ back, prev, next }} />
    <figure>
      <img src={`/${image.filePath}`} alt={image.meta.title} />
      {image.meta.description && (
        <figcaption
          dangerouslySetInnerHTML={{ __html: image.meta.description }}
        />
      )}
    </figure>
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

Image.defaultProps = {
  next: null,
  prev: null,
};

Image.propTypes = {
  image: types.image.isRequired,
  back: types.pageRef.isRequired,
  next: types.pageRef,
  prev: types.pageRef,
};

export default Image;
