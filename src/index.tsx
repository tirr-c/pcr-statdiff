import styled from 'astroturf';
import React from 'react';
import ReactDOM from 'react-dom';

import { applySnapshot, onSnapshot } from 'mobx-state-tree';

import 'normalize.css';
import './reset.css';

import { UnitStore } from './state';
import ApolloClientTransport from './transport/ApolloClientTransport';

import App from './App';

const transport = new ApolloClientTransport({
    uri: GQL_ENDPOINT,
});

const Footer = styled.footer`
    margin-top: 8px;
    border-top: 1px solid silver;
    font-size: 0.8em;
    word-break: keep-all;
`;

const store = UnitStore.create(
    {},
    { transport },
);
const snapshot = localStorage.getItem('snapshot');
if (snapshot != null) {
    try {
        applySnapshot(store, JSON.parse(snapshot));
    } catch (err) {
        console.error(err);
        localStorage.removeItem('snapshot');
    }
}
onSnapshot(store, snapshot => {
    localStorage.setItem('snapshot', JSON.stringify(snapshot));
});

ReactDOM.render(
    <>
        <h1>{TITLE}</h1>
        <App state={store} />
        <Footer>
            <p>
                버전 <code>{VERSION}</code>, 소스 코드는 MIT 라이선스로 <a href={REPOSITORY_URL}>배포되고 있습니다</a>.
            </p>
            <p>
                <code>{new URL(GQL_ENDPOINT).host}</code>, <code>{new URL(STATIC_BASE_URL).host}</code>에서 제공되는
                데이터의 저작권은 {ORIGINAL_ASSET_COPYRIGHT}에 있습니다.
            </p>
        </Footer>
    </>,
    document.getElementById('app'),
);
