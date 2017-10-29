import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const TagLink = ({ slug, title }) => {
  const linkProps = {
    href: {
      pathname: '/tag',
      query: { tag: slug },
    },
    as: {
      pathname: `/tag/${slug}/`,
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
        <a>{title}</a>
      </Link>
    </span>
  );
};

TagLink.propTypes = {
  slug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default TagLink;
