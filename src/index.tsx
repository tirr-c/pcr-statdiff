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
        <App />
    </ApolloProvider>,
    document.getElementById('app'),
);
