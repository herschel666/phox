import React from 'react';
import path from 'path';
import fetch from 'isomorphic-fetch';
import Frame from '../src/components/frame';
import ImageNav from '../src/components/image-nav';
import TagLink from '../src/components/tag-link';
import { hostname, port } from '../phox.config';
import * as types from '../src/prop-types';
import { titleWithFallback } from '../src/util';

// eslint-disable react/no-danger
const Image = ({ image, back, next, prev }) => {
  const ratio = image.meta.height / image.meta.width;
  return (
    <Frame
      title={`Photo "${titleWithFallback(image.meta.title)}" :: phox`}
      headline={titleWithFallback(image.meta.title)}
    >
      <style jsx>{`
        figure {
          margin: 36px 0 0 0;
        }

        span {
          display: block;
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 0;
        }

        img {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        dl {
          padding-top: 14px;
          border-top: 1px solid #ccc;
          font-size: 14px;
        }

        dt,
        dd {
          display: inline;
        }

        dt::after {
          content: ': ';
        }
      `}</style>
      <ImageNav {...{ back, prev, next }} />
      <figure>
        <span
          style={{
            paddingTop: `${(ratio * 100).toFixed(6)}%`,
          }}
        >
          <img src={`/${image.filePath}`} alt={image.meta.title} />
        </span>
        {image.meta.description && (
          <figcaption
            dangerouslySetInnerHTML={{ __html: image.meta.description }}
          />
        )}
      </figure>
      {image.meta.tags && (
        <dl>
          <dt>Tags</dt>
          <dd>{image.meta.tags.map(tag => <TagLink key={tag} tag={tag} />)}</dd>
        </dl>
      )}
    </Frame>
  );
};
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
