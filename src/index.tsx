import { css } from 'astroturf';
import React from 'react';
import ReactDOM from 'react-dom';

const styles = css`
    .centered {
        text-align: center;
    }
`;

ReactDOM.render(
  <div className={styles.centered}>Hello, world!</div>,
  document.getElementById('app'),
);
