Install
-postgresql
-Node.js

Set up Database by entering 
CREATE DATABASE "Timebros"; 
into psql terminal and run

Password is Timebros as well for pgadmin

Create table for user details for signup by entering 
---------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
---------------
into psql terminal and run

Create table for modules by entering 
---------------
CREATE TABLE modules (
    code VARCHAR(20) PRIMARY KEY,
    title TEXT,
    description TEXT,
    credits INTEGER
);
---------------
into psql terminal and run

Create table for lessons by entering 
---------------
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_code VARCHAR(20) REFERENCES modules(code),
    class_no VARCHAR(20),
    lesson_type VARCHAR(50),
    day VARCHAR(15),
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    venue TEXT
);
---------------
into psql terminal and run

on vscode cd into "Timebros Backend"
now seed the database with the modules taken from nusmods by running 
---------------
node seed.js
---------------
in vscode

start the server by running in vscode
---------------
node server.js
---------------

in another terminal on vscode cd to "Timebros Frontend" and run
---------------
npm run dev
---------------

Go to: http://localhost:5173 to view the website

















