## Recipe Sharing Platform with OOP
This project serves as the backend for the Recipe Sharing Platform with OOP, providing authentication and CRUD operations for user profiles and recipes.

## Features

- User registration and login with JWT authentication.
- CRUD operations for user profiles.
- CRUD operations for recipes.

  
### Prerequisites
- Node.js
- SQLite3

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SukanyaWebDev/Swivl-backend-assignment.git

### Usage

1.Register a new user: POST /register
2.Login: POST /login
3.Update user profile: PUT /profile
4.Create a new recipe: POST /recipes
5.Retrieve a specific recipe: GET /recipes/:id
6.Update a specific recipe: PUT /recipes/:id
7.Delete a specific recipe: DELETE /recipes/:id


### Authentication
This project uses JWT for authentication. Include the token in the Authorization header for authenticated requests.

### Database Initialization
The database is initialized with sample data for demonstration purposes.

