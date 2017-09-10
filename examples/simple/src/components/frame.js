import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { MAX_WIDTH, BREAKPOINT_MEDIUM } from '../constants';
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
        width: calc(100% - 36px);
        max-width: ${MAX_WIDTH};
        padding: 18px 0;
        margin: 0 18px;
        flex: 1;
      }

      @media screen and (min-width: ${BREAKPOINT_MEDIUM}) {
        main {
          margin-left: auto;
          margin-right: auto;
        }
      }
    `}</style>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/ico" href="/static/favicon.ico" />
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
