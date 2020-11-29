import {
    SIGN_IN,
    SIGN_OUT
} from './types/types';

export const signIn = data => {
    return {
        type: SIGN_IN,
        payload: data,
    };  
};

export const signOut = () => {
    return {
        type: SIGN_OUT
    }
}