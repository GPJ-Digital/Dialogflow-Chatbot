// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const axios = require('axios');
const token = 'xKMSZhULcG0d4dWc64chFpa4Tf55ywryVPlrZtUunyA15C2SgARr98I9AGSSAQlEG6JS1TAQxzhwgBLktPL5_0P8Qh0a7UsgZ2QlrMnAhSfUHDFIYG84b8RnSb_JXXYx';

const baseUrl = 'https://api.yelp.com/v3/';
const businessSearchUrl = 'businesses/search';

const AuthStr = 'Bearer ' + token;

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Hey there! I am LunchBot. A bot to help get you a place to eat quick. What city do you live located?`);
    }
    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }


    function findUserCity(agent) {
        const whichCity = agent.parameters.city;
        var URL = `https://api.yelp.com/v3/businesses/search?limit=3&location=${whichCity}`;
        return axios.get(URL, { 'headers': { 'Authorization': AuthStr } })
            .then((result) => {
                console.log(result.data);
                var businessName = result.data.businesses[0].name;
                var businessRating = result.data.businesses[0].rating;
                //agent.add(`Name: `+ businessName);
                //agent.add(`Rating: `+ businessRating);

            });
    }


    function createMessage(businessName, businessRating, businessImg, businessLink) {
        var HEADER = {
            "title": "Name (" + businessName + ")"
        };

        return {
            "cards": [{
                "header": HEADER,
                "sections": [{
                    "widgets": [{
                        "textParagraph": {
                            "text": response
                        }
                    }]
                }]
            }]
        };
    }


    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('findCity', findUserCity);
    agent.handleRequest(intentMap);
});



function createMessage(businessName, businessRating, businessImg, businessLink) {
    return {
        "cards": [
            {
                "header": {
                    "title": businessName,
                    "subtitle": "Ratings " + businessRating,
                    "imageUrl": "https://goo.gl/aeDtrS"
                },
                "sections": [
                    {
                        "header": "Location",
                        "widgets": [
                            {
                                "image": {
                                    "imageUrl": businessImg
                                }
                            }
                        ]
                    },
                    {
                        "widgets": [
                            {
                                "buttons": [
                                    {
                                        "textButton": {
                                            "text": "OPEN ORDER",
                                            "onClick": {
                                                "openLink": {
                                                    "url": businessLink
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
}