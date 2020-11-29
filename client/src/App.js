import { Switch, Route } from 'react-router-dom';
import login from './Components/login';
import dashboard from './Components/dashboard';
import signup from './Components/signup';
import history from './Components/history';
import RequireAuth from "./RequireAuth";

function App() {
  return (
    <div>
      <Switch>
        <Route exact path={"/login"} component={login} />
        <Route exact path={"/"} component={RequireAuth(dashboard)} />  
        <Route exact path={"/history"} component={RequireAuth(history)} />  
        <Route exact path={"/signup"} component={signup} />
      </Switch>
    </div>
  );
}

export default App;
