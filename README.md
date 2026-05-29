# Timebros Local Setup Guide

## Prerequisites

Download and install the following:
- PostgreSQL — set the `postgres` user password to `Timebros` during installation
- Node.js

## Set up Database

Open pgAdmin or the psql terminal and run the following commands one at a time:

Create the database:
```sql
CREATE DATABASE "Timebros";
```

Create the users table:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Create the modules table:
```sql
CREATE TABLE modules (
    code VARCHAR(20) PRIMARY KEY,
    title TEXT,
    description TEXT,
    credits INTEGER
);
```

Create the lessons table:
```sql
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
```

## Install Dependencies

In VS Code, cd into TimeBros Backend and run:
```bash
npm install
```

In a new terminal, cd into TimeBros Frontend and run:
```bash
npm install
```

## Seed the Database

In the TimeBros Backend terminal run:
```bash
node seed.js
```

Wait for `Done` before continuing.

## Start the App

In the TimeBros Backend terminal run:
```bash
node server.js
```

In the TimeBros Frontend terminal run:
```bash
npm run dev
```

## Open in Browser

Go to: http://localhost:5173
















