import styled from 'astroturf';
import React from 'react';
import ReactDOM from 'react-dom';

import ApolloClient from 'apollo-boost';

import { State } from './state';
import App from './App';

const apolloClient = new ApolloClient({
    uri: GQL_ENDPOINT,
});

const ORIGINAL_ASSET_COPYRIGHT = 'Cygames와 카카오게임즈';

const Copyright = styled.footer`
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid silver;
    font-size: 0.8em;
    word-break: keep-all;
`;

ReactDOM.render(
    <>
        <h1>프리코네R 캐릭터 스탯</h1>
        <App state={new State(apolloClient)} />
        <Copyright>
            <code>{new URL(GQL_ENDPOINT).host}</code>, <code>{new URL(STATIC_BASE_URL).host}</code>에서 제공되는
            데이터의 저작권은 {ORIGINAL_ASSET_COPYRIGHT}에 있습니다.
        </Copyright>
    </>,
    document.getElementById('app'),
);
