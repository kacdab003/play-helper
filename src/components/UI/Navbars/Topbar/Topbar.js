import React from 'react';
import UserInfo from '../../../UserInfo/UserInfo';
import { TopbarContainer } from './StyledTopbar';
import { TopbarButton } from './TopbarButton/TopbarButton';
import { TopbarNavlink } from './TopbarNavlink/TopbarNavlink';

const Topbar = ({ onLoginModalOpened, onSignInModalOpened, isAuthenticated, fullName }) => {
    const content = isAuthenticated ? (
        <>
            <TopbarNavlink to="/logout">Wyloguj</TopbarNavlink>
            <TopbarNavlink to="/user-panel" width="12rem">
                Panel użytkownika
            </TopbarNavlink>
            <UserInfo rightCorner username={fullName} />
        </>
    ) : (
        <>
            <TopbarButton onClick={onLoginModalOpened}>Zaloguj</TopbarButton>
            <TopbarButton onClick={onSignInModalOpened}>Załóż konto</TopbarButton>
        </>
    );
    return <TopbarContainer>{content}</TopbarContainer>;
};

export default Topbar;
