import React from 'react';
import EnvDataProp from '../../../../props/EnvData';

export const Home = ({ envData }: { envData: EnvDataProp }) => {
    return (
        <div className="wrapper">
            <h2>Welcome to {envData.name}!</h2>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit.</p>
            <h4>Fund logo</h4>
            <img src={'assets/img/logo.svg'} alt="" />
            <h4>Common me-app logo</h4>
            <img src={'assets/img/me-logo.svg'} alt="" />
            <br />
            <div className="square"></div>
            <br />
            <h4>Environment data</h4>
            <pre
                style={{
                    width: '50%',
                    backgroundColor: 'silver',
                    margin: 'auto',
                    padding: '10px',
                    textAlign: 'left',
                }}>
                {JSON.stringify(envData, null, '    ')}
            </pre>
        </div>
    );
};
