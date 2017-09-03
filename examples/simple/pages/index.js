import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';

const Index = ({ content, albums }) => (
  <Frame title="Simple example :: phox">
    <div>
      <h1>{content.meta.title}</h1>
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
    </div>
  </Frame>
);

Index.getInitialProps = async ({ req }) => {
  // Only use complete URL on the server-side
  const host = Boolean(req) ? 'http://localhost:3000' : '';
  const res = await fetch(`${host}/data/index.json`);
  return await res.json();
};

export default Index;
