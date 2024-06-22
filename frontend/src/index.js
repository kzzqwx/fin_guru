import { DeviceThemeProvider, SSRProvider } from '@salutejs/plasma-ui';
import ReactDOM from 'react-dom';
import { GlobalStyle } from './GlobalStyle';
import { App } from './App';
import { ModalsProvider } from '@salutejs/plasma-web';
import React from "react";
import "./style.css";




ReactDOM.render(
    <DeviceThemeProvider>
        <SSRProvider>
            <ModalsProvider>
                    <App />
                    <GlobalStyle />
            </ModalsProvider>
        </SSRProvider>
    </DeviceThemeProvider>,
    document.getElementById('root'),
);

