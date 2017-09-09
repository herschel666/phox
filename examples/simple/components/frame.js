import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Footer from './footer';
import Header from './header';

const Frame = ({ title, headline, description, children }) => (
  <div>
    <style jsx>{`
      .frame {
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        flex: 1;
        min-height: 100vh;
        flex-grow: 1;
      }
      main {
        padding: 18px;
        flex: 1;
      }
    `}</style>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link href="/static/base.css" rel="stylesheet" />
    </Head>
    <div className="frame">
      <Header headline={headline} />
      <main>{children}</main>
      <Footer />
    </div>
  </div>
);

Frame.defaultProps = {
  description: null,
};

Frame.propTypes = {
  title: PropTypes.string.isRequired,
  headline: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Frame;
