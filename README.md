# stateHighlightProject
# Project Overview
The project is a web application that integrates a frontend built with Angular and a backend using Go (GraphQL). 
Users can input the names of U.S. states, get autocomplete suggestions, and see the selected state highlighted on a Google Map.

## Frontend (Angular)
### Dependencies
First, ensure that Node.js is installed. Navigate to the frontend directory and install the required dependencies:

cd state-typeahead
npm install

### Run the Frontend Application

ng serve

The frontend will be running on http://localhost:4200/. 

# Backend (Golang + GraphQL)
## Dependencies
Ensure that Go is installed and go mod is initialized. Navigate to the backend directory and install the necessary dependencies:

cd backend
go mod tidy

### Run the Backend Service

go run main.go

The backend service will be running on http://localhost:8080/.


