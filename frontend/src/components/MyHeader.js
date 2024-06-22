import React from 'react';
import { Header } from '@salutejs/plasma-ui';


export const MyHeader = () => {    
	return (
        <Header style={{width: '50rem', marginLeft: '7.5rem'}}
            back={true}
            //logo="logo.jpg"
            title="Финансовый Гуру"
            subtitle="Управляй финансами как гуру"/>
    );
};
