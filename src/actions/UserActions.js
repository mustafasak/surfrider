import moment from 'moment';

import {
  API_BASE
} from "../config/app";

import {
  fetchMyChapters
} from './ChapterActions';

export const FETCH_LOGIN_USER = '@@USER//FETCH_LOGIN';
export const FETCH_LOGIN_USER_SUCCESS = '@@USER//FETCH_LOGIN_SUCCESS';
export const FETCH_LOGIN_USER_ERROR = '@@USER//FETCH_LOGIN_ERROR';

export const FETCH_VERIFY_USER = '@@USER//FETCH_VERIFY';
export const FETCH_VERIFY_USER_SUCCESS = '@@USER//FETCH_VERIFY_SUCCESS';
export const FETCH_VERIFY_USER_ERROR = '@@USER//FETCH_VERIFY_ERROR';

export const LOGOUT_USER = '@@USER//LOGOUT';

export const SET_TOKEN = '@@USER//SET_TOKEN';

export const loginUser = (email, password) => async (dispatch) => {
  dispatch({
    type: FETCH_LOGIN_USER
  });

  try {
    const data = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      }),
    }).then(response => response.json());

    localStorage.setItem('auth', JSON.stringify({
      token: data.token,
      expires: moment().add(data.expires_in, 'seconds').format(),
    }));

    dispatch({
      type: FETCH_LOGIN_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const data = await error.json();

    dispatch({
      type: FETCH_LOGIN_USER_ERROR,
      payload: data,
    });
  }
}

export const verifyUser = () => async (dispatch) => {
  const auth = JSON.parse(localStorage.getItem('auth'));

  if (auth && auth.token && auth.expires) {
    const {
      token,
      expires
    } = auth;
    const currentDate = moment();
    const expirationDate = moment(expires);

    if (currentDate.isSameOrBefore(expirationDate)) {
      dispatch({
        type: SET_TOKEN,
        payload: token,
      });

      dispatch({
        type: FETCH_VERIFY_USER
      });

      try {
        const data = await fetch(`${API_BASE}/auth/me`, {
            method: 'POST'
          })
          .then(response => response.json());

        await dispatch(fetchMyChapters());

        dispatch({
          type: FETCH_VERIFY_USER_SUCCESS,
          payload: data,
        });
      } catch (error) {
        localStorage.removeItem('auth');
        dispatch({
          type: FETCH_VERIFY_USER_ERROR,
        });
      }
    } else {
      localStorage.removeItem('auth');
      dispatch({
        type: FETCH_VERIFY_USER_ERROR,
      });
    }
  } else {
    localStorage.removeItem('auth');
    dispatch({
      type: FETCH_VERIFY_USER_ERROR,
    });
  }
}

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('auth');

  dispatch({
    type: LOGOUT_USER,
  });
}