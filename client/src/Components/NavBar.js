import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

const NavBar = (props) => {

    const gotoRoute = (e, endpoint) => {
        e.preventDefault();
        props.history.push(endpoint);    
    }

    const logout = (e, endpoint) => {
        e.preventDefault();
        localStorage.removeItem('paper-trading-token');
        props.history.push(endpoint);    
    }

    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="/" onClick={(e) => gotoRoute(e, '/')}>Paper Trading</Navbar.Brand>
            <Nav className="mr-auto">
                <Nav.Link href="/"  onClick={(e) => gotoRoute(e, '/')}>Home</Nav.Link>
                <Nav.Link href="/history" onClick={(e) => gotoRoute(e, '/history')}>Trade History</Nav.Link>
            </Nav>
            <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        Welcome: <b>{`${props.username}`}</b>
                    </Navbar.Text>
                    <Nav.Link href="/logout" onClick={(e) => logout(e, '/login')}>Logout</Nav.Link>
                </Navbar.Collapse>
        </Navbar>
    );
};

export default withRouter(NavBar);