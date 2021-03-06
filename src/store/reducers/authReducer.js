import * as actionTypes from '../actions/actionsTypes';

const initialState = {
    token: null,
    userId: null,
    error: null,
    loading: false,
    fullName: '',
};

const authStart = (state) => {
    return {
        ...state,
        loading: true,
        error: null,
    };
};
const authSuccess = (state, action) => {
    return {
        ...state,
        token: action.idToken,
        userId: action.userId,
        fullName: action.fullName,
        error: null,
        loading: false,
    };
};

const authFail = (state, action) => {
    return {
        ...state,
        error: action.error,
        loading: false,
    };
};

const authLogout = (state) => {
    return {
        ...state,
        token: null,
        userId: null,
    };
};
const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.AUTH_START:
            return authStart(state, action);
        case actionTypes.AUTH_SUCCESS:
            return authSuccess(state, action);
        case actionTypes.AUTH_FAIL:
            return authFail(state, action);
        case actionTypes.AUTH_LOGOUT:
            return authLogout(state, action);
        default:
            return state;
    }
};

export default authReducer;
