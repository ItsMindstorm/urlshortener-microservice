# URL Shortener Microservice
This microservice turns a valid input url of the format: `https://www.youraddress.com` into a shortened number code in the form of JSON: 
```json 
{
    "original_url": "Your input url",
    "short_url": 32460
}
```
This code can then used with a `GET` request at `/api/shorturl/:url` and the service will redirect you to your desired origin url. 

The codes and associated urls are stored in a mongoDB database in the cloud.

## Caveat 
This service is hosted on [render](render.com) with the free instance plan. As a result, the service will spin down after inactivity.
