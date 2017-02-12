import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Map} from './Map';

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

let render = () => {
  ReactDOM.render(
    <Map imageUrl={require('./test.jpg')} />,
    MOUNT_NODE
  );
};

// ========================================================
// Go!
// ========================================================
render();
