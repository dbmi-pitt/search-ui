import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { APP_TITLE } from "../config/config"

function Navigation() {
    return (
        <Navbar bg="dark" variant="dark">
                <Container>
                  <Navbar.Brand href="#home">
                    {APP_TITLE}
                  </Navbar.Brand>
                </Container>
        </Navbar>
    )
}

export default Navigation;