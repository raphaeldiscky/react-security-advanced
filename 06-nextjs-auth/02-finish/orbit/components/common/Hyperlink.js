import React from 'react';
import Link from 'next/link';

const Hyperlink = ({ text, to }) => (
  <Link href={to}>
    <a className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150">
      {text}
    </a>
  </Link>
);

export default Hyperlink;
