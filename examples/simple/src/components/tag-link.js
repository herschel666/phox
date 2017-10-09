import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const TagLink = ({ tag }) => {
  const linkProps = {
    href: {
      pathname: '/tag',
      query: { tag },
    },
    as: {
      pathname: `/tag/${tag}/`,
    },
  };

  return (
    <span>
      <style jsx>{`
        span::after {
          content: ' · ';
        }

        span:last-child::after {
          content: '';
        }
      `}</style>
      <Link {...linkProps}>
        <a>{tag}</a>
      </Link>
    </span>
  );
};

TagLink.propTypes = {
  tag: PropTypes.string.isRequired,
};

export default TagLink;
