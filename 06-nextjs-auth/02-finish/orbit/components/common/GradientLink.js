import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';

const GradientLink = ({ to, text, size }) => {
  const classes = classNames({
    'flex justify-center rounded-full py-2 px-6 bg-gradient focus:outline-none shadow-lg text-white': true,
    'text-xl': size === 'lg'
  });
  return (
    <Link href={to}>
      <a className={classes}>{text}</a>
    </Link>
  );
};

export default GradientLink;
