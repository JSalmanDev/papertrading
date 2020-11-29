const initialState = {
  user: {}
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'SIGN_IN':
      return {...state, user: action.payload};
    case 'SIGN_OUT': 
      return {...state, user: {} };
    default:
      return state;
  }
}