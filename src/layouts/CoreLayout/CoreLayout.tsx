import * as React from 'react';
import './CoreLayout.scss';

export const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    {children}
  </div>
);

export default CoreLayout;
