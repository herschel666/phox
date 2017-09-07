import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';

const Index = ({ content, albums }) => (
  <Frame title="Simple example :: phox" headline={content.meta.title}>
    <div dangerouslySetInnerHTML={{ __html: content.body }} />
    <hr />
    <ul>
      {albums.map(({ title, linkProps }, i) => (
        <li key={i}>
          <Link {...linkProps}>
            <a>{title}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Frame>
);

Index.getInitialProps = async ({ req }) => {
  // Only use complete URL on the server-side
  const host = Boolean(req) ? `http://${hostname}:${port}` : '';
  const res = await fetch(`${host}/data/index.json`);
  return await res.json();
};

export default Index;
