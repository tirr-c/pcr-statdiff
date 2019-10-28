import { css } from 'astroturf';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';

import App from './App';

const apolloClient = new ApolloClient({
    uri: GQL_ENDPOINT,
});

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
        <h1>프리코네R 캐릭터 스탯</h1>
        <App />
    </ApolloProvider>,
    document.getElementById('app'),
);
