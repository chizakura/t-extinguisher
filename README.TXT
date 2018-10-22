ExTinguisher
--------------
ExTinguisher is an extension of Tinder with the purpose of allowing users to rate their past dates.

Getting Started
----------------
The instructions below will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

Pre-requisites
---------------
Download the "t-extinguisher" folder in the Google Drive
Install Apache Tomcat version 9.0

Installing
-----------
Place the "t-extinguisher" folder in "..\Apache Software Foundation\Tomcat 9.0\webapps"

To manually run Apache Tomcat Server:
Search for "Run" on your desktop
Open: services.msc
Look for "Apache Tomcat 9.0 Tomcat9"
Right-click and "start" the service

Open a web browser
In the address field type, "localhost:8080/t-extinguisher"

Running the Tests
------------------
Go to "https://t-extinguisher.firebaseapp.com"
Click "Sign Up" to register and create an account
After confirming your email verification link, then you can start rating other available users
Rate users on a scale of 1-10 and add comments
Connect to Facebook by sharing comments or going to ExTinguisher's Facebook page
Connect to Instagram by going to ExTinguisher's Instragram profile

Deployment
-----------
To access database in Google Firebase, permission must be requested to lchin@nyit.edu.

Once permission is granted:
Install Node.js version 8.11
Open cmd and type "npm install -g firebase-tools"
Sign in to Google: type "firebase login"
Deploy your website: firebase deploy (make sure to cd to "..\t-extinguisher")

Note: All changes to files must be place in "..\t-extinguisher\public" before deployment

Build With
-----------
Bootstrap - HTML/CSS template used
Google Firebase - authentication, database, web hosting