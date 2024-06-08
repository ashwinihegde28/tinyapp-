# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

- Registration Page<br>
  !["User Registration Page"](https://github.com/ashwinihegde28/tinyapp/blob/master/docs/registerPage.png)<br>
- Login Page <br>
  !["User Login Page"](https://github.com/ashwinihegde28/tinyapp/blob/master/docs/loginPage.png)<br>
- Create New Url Page<br>
  !["Create New urls"](https://github.com/ashwinihegde28/tinyapp/blob/master/docs/AddNewUrl.png)<br>
- Show URLs page<br>
  !["Display urls"](https://github.com/ashwinihegde28/tinyapp/blob/master/docs/shhowUrlsPg.png)<br>
- Edit URLs Page <br>
  !["Edit urls"](https://github.com/ashwinihegde28/tinyapp/blob/master/docs/EditPage.png)<br>

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Install EJS, bcryptjs and cookie-session dependencies.
- Install nodemon, then npm start command to start the server.
- Type http://localhost:8080/ to host the application on the browser with appropriate page name.

### Brief Summary of the project

- Registration page will facilitate only the new user registration.
- Login page allows only authenticated users to login to Tiny app.
- Post login the user can create the urls, edit and delete them only if it's created by them and those urls exist.

#### Important Note

- While adding urls please append "http://" else there will be an error.
- Stretch Activities are not included.
