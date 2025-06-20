![logo_text_vertical_dark.svg](https://superwise.at/img/logo/logo_text_vertical_dark.svg)
# SuperWise - The better way to find your thesis supervisor

## Features

**AI-Powered Matching**: 
Our advanced AI algorithm matches students with supervisors based on research interests and expertise.


**Smart Search**: 
Find the perfect supervisor with our intelligent search system that understands your research needs.


**Analytics Dashboard**: 
Track your progress and get insights into your research journey with our comprehensive dashboard.

Learn more about the features on our [website](https://superwise.at).


# How to install and run the project

# Prerequisites
- Node.js (v18 or higher)
- a running postgres database
- [Clerk](https://clerk.com/) account for authentication
- A JSON with tags from the [Tag Similarity Tool](https://github.com/Mohammed87FS/Tags_Similarity_Calcualtion) or this [starter file](starter_tags.json)
- A CSV file with supervisors and their open slots, available slots, first name, last name and email. The CSV file should have the format of this [example file](example_supervisors.csv), which can be used for testing purposes.

# Clerk Account setup
- Visit [Clerk](https://clerk.com/) and create an account.
- Create a new application in Clerk and navigate to the "configure" tab
- Set the sign up method to "Email Adress", enable "require email during sign up", "Require email during sign-up", and "Email verification code"
The final settings should look like this:
![img_1.png](img_1.png)![img_2.png](img_2.png)

- then, navigate to the "JWT templates" section in the sidebar, and create a new JWT template with the following settings:
- Name: `Superwise JWT`
- Claims: 
  `{
"email": "{{user.primary_email_address}}"
}`

- Then, navigate to the "API Keys" section in the sidebar, and copy the "Publishable Key" and "Secret Key" to your Frontend `.env` file. If you don't have a `.env`file already, create one in the root of the "Frontend" folder. The section youre looking for looks like this: 

![img_3.png](img_3.png) 

make sure to select "Nuxt" as the framework.

# Clone the repository
- Clone the repository to your local machine:
```bash
git clone https://github.com/App-Dev-3/Superwise.git
```
- Navigate to the project directory:
```bash
cd Superwise
```

# Environment Variables - Frontend
- Create a `.env` file in the root of the "Frontend" folder if you don't have one already.
- Copy the contents of the `.env.example` file to your `.env` file.
- Paste the Clerk Publishable Key and Secret Key into the `.env` file.
- Set the NEST_API_URL to the URL of your backend API (dont forget the port if you are running it locally, e.g. `http://localhost:8080`)
- Set the ALLOWED_EMAIL_DOMAINS to the email domains you want to allow for sign up (e.g. `fhstp.ac.at,gmail.com`)

# Running the Frontend

## Local
- Ensure you are in the Frontend directory:
```bash
cd Frontend
```
- Install dependencies:
```bash
npm install
```
- Run the application:
```bash
npm run dev
```

## Production
- you need a node.js hosting service like Netlify, Vercel, Coolify, or similar.
- Load the repository
- set the start command to `node .output/server/index.mjs`
- set the build command to `npm run build`
- set the base directory to `/Frontend`

for example, if you are using [Coolify](https://coolify.io/), this is how your settings should look like:

![img_4.png](img_4.png)

- Set the environment variables in the hosting service to match the ones you set in your `.env` file.
- Ideally, switch the clerk instance you are using to production mode.

Thats it, you can now access your frontend application at the URL provided by your hosting service (or your custom domain if you set one up).

# Environment Variables - Backend
- Create a `.env` file in the root of the "backend" folder if you don't have one already.
- Copy the contents of the `.env.example` file to your `.env` file.
- Set the NODE_ENV to `production` if you want to run the backend in production mode, or `development` if you want to run it in development mode.
- Set the PORT to the port you want to run the backend on (default is `8080`).
- Set the FRONTEND_HOST to the URL of your frontend application (e.g. `http://localhost:3000` if you are running it locally).
- Set the ALLOWED_EMAIL_DOMAINS to the email domains you want to allow for sign up (e.g. `fhstp.ac.at,gmail.com`), same as in the Frontend
- Set the DATABASE_URL to the URL of your postgres database (e.g. `postgres://user:password@localhost:5432/superwise`)
- Set the CLERK_JWKS_URI to the JWKS URL of your Clerk application (you can find this in the Clerk dashboard under "API Keys" section)
- Set the SUPERVISION_REQUEST_COOLDOWN_DAYS to the number of days you want to wait before a student can send a second supervision request to an already requested supervisor(default is `0`)

# Setting up the Backend
## Local
Follow the instructions from the [Backend README](backend/README.md) to run the backend locally.

## Production
- you need a node.js hosting service like Netlify, Vercel, Coolify, or similar.
- Load the repository
- make sure to select the "Backend" folder as the base directory
- set the environment variables in the hosting service to match the ones you set in your `.env` file.
- set the build command to `npm install && npx prisma migrate deploy &&npm run build`
- set the start command to `npm run start:prod`
- If you are using [Coolify](https://coolify.io/), this is how your settings should look like:

![img_5.png](img_5.png)

# Setting up the database
- Make sure you have a running postgres database from any hosting service. The currently deployed version of SuperWise project uses SupaBase.
- Copy the connection URL and make sure it starts with `postgresql://`.
- Set the DATABASE_URL in your `.env` file to the connection URL of your postgres database.

# Running the database migrations
if you set up the backend locally, you can run the migrations with the following command:
```bash
npx prisma migrate dev
```

if you set up the backend in production, you can run the migrations with the following command:
```bash
npx prisma migrate deploy
```

if you are using a hosting service like Coolify, the migrations will be run automatically when you deploy the backend (Assuming you followed the instructions above and the commands are set correctly).

- You can now start the backend and frontend applications and access them at the URLs provided by your hosting service or your local machine.

# Using the application
- To use the application, you need at least one admin account. You can create an admin account by manually in the database, by adding a user with the role `admin`, email `<your-email>` in the `users` table.
- Then sign up with the same email address in the application to become an admin user.
- Once you are logged in, you can add supervisors and their open slots using the "Add Supervisor" button in the dashboard.
- You can also add tags to supervisors using the "Add Tags" button in the dashboard.
- You can search for users and supervisors using the search bar in the dashboard.


Any user that is not an admin or a supervisor (from the supervisors CSV file), will be automatically assigned the role `student`.

Users that got imported from the supervisors CSV file will be assigned the role `supervisor`, provided they sign up with the same email address as in the CSV file.

# Contributing
We welcome contributions to the SuperWise project! If you have any ideas, suggestions, or improvements, feel free to open an issue or submit a pull request.

# License
See the [LICENSE](LICENSE) file for details.

# Contact
For any questions or feedback, please contact us at [help@superwise.at](mailto:help@superwise.at]. Should there be any issues with the application, please open an issue or contact us via email.