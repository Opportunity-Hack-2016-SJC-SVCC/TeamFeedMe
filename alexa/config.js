'use strict';
module.exports = {
    appId: 'amzn1.ask.skill.8c2c1781-75c9-4670-b8ca-e56ce06bab5a',
    arn: 'ARN - arn:aws:lambda:us-east-1:850577149088:function:decision-tree_lambda-function_feedme',
    twilio: {
        accountSid: '',
        authToken: '',
        basicAuthToken: '',
        apiUrl: '',
        fromPhone: '',
        toPhone: ''
    },
    runscope: {
        bucket: 'xu9xzjzri1l9',
        url: 'xu9xzjzri1l9.runscope.net'
    },
    meal: {
        requestType: {
            type1: 'donate',
            type2: 'request'
        },
        mealType: {
            type1: 'vegetarian',
            type2: 'non vegetarian',
            type3: 'vegan',
            type4: 'halal',
            type5: 'kosher'
        },
        userInput: {
            firstChoicePrompt: "Do You want to Donate or Request a Meal ? You may say ",
            mealDonateCountPrompt: "Thanks for Donating Meals. How many meals can you Donate ?",
            thanksDonatePrompt: "Thanks for Donating meals.",
            thanksRequestPrompt: "Thanks for Requesting meals.",
            itemChoices: "vegetarian, non vegetarian or vegan",
            welcomePrompt: "",
            expirationPrompt: "Do you have an expiration time period for the meals ? You can say something like 6 hours or say no.",
            locationConfirmPrompt: "Can you confirm your location as 2211 North First Street San Jose, California",
            locationConfirmPrompt2: "Can you confirm your location as 3970 Rivermark Plaza Santa Clara, California",
            kindOfMealPrompt: "What kind of meal you want ? You may saym I am looking for a ",
            mealDeliveryConfirmPrompt: "Meal Delivery confirmed ! We will be delivery it shortly. ",
            unableToFindRequestedMealPrompt: "We are very sorry ! We are unable To Find Requested Meal for you.",

            welcomeMessage: "Welcome to FeedMe, Do You want to Donate or Request a Meal? Pls. say Donate or Request.",
            repeatWelcomeMessage: "Pls. say Donate or Request. You may say no or cancel to quit.",
            promptToStartMessage: "Say Donate or Request. You may say no or cancel to quit."
        }
    }
};