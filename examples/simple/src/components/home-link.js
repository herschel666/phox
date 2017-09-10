import React from 'react';
import Link from 'next/link';

export default () => (
  <div>
    <style jsx>{`
      span {
        display: block;
        margin-bottom: 36px;
      }

      span::before {
        content: '«';
        padding-right: 4px;
      }
    `}</style>
    <span className="back">
      <Link href="/">
        <a>Home</a>
      </Link>
    </span>
  </div>
);
