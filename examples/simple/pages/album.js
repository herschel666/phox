import path from 'path';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';

const Album = ({ content, images, url }) => (
  <Frame title={`${content.meta.title} :: phox`}>
    <div>
      <h1>{content.meta.title}</h1>
      <hr />
      &laquo;{' '}
      <Link href="/">
        <a>Home</a>
      </Link>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: content.body }} />
      <ul>
        {images.map(({ filePath, detailLinkProps, meta }, i) => (
          <li key={i}>
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
    </div>
  </Frame>
);

Album.getInitialProps = async ({ query, req }) => {
  const host = Boolean(req) ? 'http://localhost:3000' : '';
  const { album } = query;
  const res = await fetch(`${host}/${path.join('data/albums', album)}.json`);
  return await res.json();
};

export default Album;
