# t-courses--api
APIs for T-Courses project

-----------------
This project was started at 22/01/2021, i don't know when it finish but i will try to finish it with best result!

This project is a system with some technology is ReactJS, ReactNative (for android and ios in the future), NodeJS (for backend), MySQL (for database).

This repo is backend code ( i will use expressJS, it is a framework for NodeJS in backend ).

-----------------
## Setup something...
> You need to setup something to run this project
### Database
1. Create a schema with name is '**your_database_name**' in Workbench (8.0 for now). ( If you wasn't install it, install it [here](...)).
2. In workspace, create a file with name '**.env**', and paste code below to it.
    ```
      DB_NAME=your_database_name
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_USR=root
      DB_PWD=password

      APP_PORT=3000
      ADMIN_USR=admin
      ADMIN_PWD=12345678

      API_URL=localhost:3000/api/v1

      JWT_SECRET=your_jwt_secret
      TOKEN_SECRET=your_jwt_token_secret

      COURSE_KEY_SECRET=your_key_secret_for_course
      COURSE_IV_SECRET=your_iv_secret_for_course

      EMAIL_HST=email_hosting_domain
      EMAIL_PRT=email_hosting_port
      EMAIL_USR=email_hosting_username
      EMAIL_PWD=email_hosting_password
    ```
    By default, your app will be run on port '3000' and connect to database with name is '*your_database_name*'.


-----------------
## Groups:
> List of modules for this project
- Auth ( for authenticate anyone ).
- Courses ( will be created by admin of system, mentor or anyone with role is admin ).
- Admins ( who have all permissions in system ).
- Mentors ( who login to system with account was created by admin, they can create course and manage their course,... ).
- Users ( who create accounts, authenticate and study in system ).
- Forum ( when anyone can ask some questions and answer, it will be a dicussion for anyone in this system ).