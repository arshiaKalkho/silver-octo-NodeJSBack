# silver-octo-NodeJSBack
the backend of silver-octo uses mySQL data base and rest api.
receives api requests from silver-octo-reactFront and returns products and user information.

The reason as to which silver-octo is designed in such way (separated in two repos) is that at the time of designe i had the store based on netlify hosting. The backend started as separate project and i didn't want the initial startup delay on the heroku servers so this will be the version until or when i decide to reconfigure the source codes into one. But the primary reason is that i can't use the same backend for applications that i used in the future, maybe in Flutter or ReactNative.
