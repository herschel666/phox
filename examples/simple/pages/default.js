import path from 'path';
import fetch from 'isomorphic-fetch';
import Link from 'next/link';
import Frame from '../components/frame';
import { hostname, port } from '../phox.config';

const Default = ({ meta, body }) => (
  <Frame title={`${meta.title} :: phox`} description={meta.description}>
    <div>
      <h1>{meta.title}</h1>
      <p dangerouslySetInnerHTML={{ __html: body }} />
      <hr />
      <Link href="/">
        <a>« Home</a>
      </Link>
    </div>
  </Frame>
);

Default.getInitialProps = async ({ query, req }) => {
  const host = Boolean(req) ? `http://${hostname}:${port}` : '';
  const { page } = query;
  const url = `${host}/${path.join('data', page)}.json`;
  const res = await fetch(url);
  return await res.json();
};

export default Default;
