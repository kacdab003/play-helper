import axios from "axios";
import * as actionTypes from "./actionsTypes";

const authStart = () => {
  return { type: actionTypes.AUTH_START };
};

const authSuccess = (token, userId, fullName) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    idToken: token,
    userId,
    fullName,
  };
};

const authFail = (error) => {
  return {
    type: actionTypes.AUTH_FAIL,
    error,
  };
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expirationDate");
  localStorage.removeItem("userId");
  localStorage.removeItem("fullName");

  return {
    type: actionTypes.AUTH_LOGOUT,
  };
};

const checkTimeout = (expirationTime) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(logout());
    }, Number(expirationTime * 1000));
  };
};

export const auth = (login, password, onSuccess) => {
  return async (dispatch) => {
    dispatch(authStart());
    try {
      const authData = { username: login, password };
      const response = await axios.post(
        "http://localhost:3001/login",
        authData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token: idToken, userId, fullName, expiresIn } = response.data;
      if (!idToken || !userId) {
        throw new Error("Unable to authenticate");
      }
      const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);

      localStorage.setItem("token", idToken);
      localStorage.setItem("expirationDate", expirationDate);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("userId", userId);
      dispatch(authSuccess(idToken, userId, fullName));
      dispatch(checkTimeout(expiresIn));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.warn(error.response);
      dispatch(authFail(error.response.data.details));
    }
  };
};

export const authCheckState = () => {
  return (dispatch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return dispatch(logout());
    }
    const userId = localStorage.getItem("userId");
    const fullName = localStorage.getItem("fullName");

    const expirationDate = new Date(localStorage.getItem("expirationDate"));

    if (expirationDate > new Date()) {
      dispatch(authSuccess(token, userId, fullName));
      return dispatch(
        checkTimeout(expirationDate.getSeconds() - new Date().getSeconds())
      );
    }
    dispatch(logout());
  };
};
