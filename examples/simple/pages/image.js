import path from 'path';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';

const titleWithFallback = title => {
  return title || 'No title';
};

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

Image.getInitialProps = async ({ query, req }) => {
  const host = Boolean(req) ? `http://${hostname}:${port}` : '';
  const { album, image } = query;
  const res = await fetch(
    `${host}/${path.join('data/albums', album, image)}.json`
  );
  return await res.json();
};

export default Image;
