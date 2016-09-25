/**
 *
 * FeedMe App Processor
 * Author: Vasu Jain : vasu.jain@live.in
 *
 */

/**
 * Intents:
 * MealTypeIntent
 * RequestTypeIntent
 * RequestMealCountIntent
 * RequestMealIntent
 * DonateMealCountIntent
 * ConfirmIntent
 *
 **/

var Alexa = require('alexa-sdk');
var http = require('http');
var util = require('./util');
var constants = require('./config.js');

Alexa.appId = constants.appId;
console.log("Alexa.appId: " +  Alexa.appId);

var states = {
    STARTMODE: '_STARTMODE',                // Prompt the user to start or restart the order.
    ASKMODE: '_ASKMODE',                    // Alexa is asking user the questions.
    DESCRIPTIONMODE: '_DESCRIPTIONMODE'     // Alexa is describing the final choice and prompting to start again or quit
};

// Decision Flow
var nodes = [
    { "node": 1, "message": "" + constants.meal.userInput.firstChoicePrompt, "donate": 2, "request": 8},
    //Donor Flow begins
    { "node": 2, "message": "" + constants.meal.userInput.thanksDonatePrompt + constants.meal.userInput.mealDonateTypePrompt, "vegetarian": 3, "nonveg": 4, "vegan": 5},
    { "node": 3, "message": "" + constants.meal.userInput.countOfMealPrompt, "five": 6, "ten" : 13, "fifty" : 14},
    { "node": 4, "message": "" + constants.meal.userInput.countOfMealPrompt, "five": 6, "ten" : 13, "fifty" : 14},
    { "node": 5, "message": "" + constants.meal.userInput.countOfMealPrompt, "five": 6, "ten" : 13, "fifty" : 14},
    { "node": 6, "message": "" + constants.meal.userInput.donorLocationConfirmPrompt, "confirm": 7, "cancel": 0, "restart": 1},
    { "node": 13, "message": "" + constants.meal.userInput.donorLocationConfirmPrompt, "confirm": 7, "cancel": 0, "restart": 1},
    { "node": 14, "message": "" + constants.meal.userInput.donorLocationConfirmPrompt, "confirm": 7, "cancel": 0, "restart": 1},
    { "node": 7, "message": "" + constants.meal.userInput.thanksDonatePrompt},
    //Requester Flow begins
    { "node": 8, "message": "" + constants.meal.userInput.thanksRequestPrompt + constants.meal.userInput.mealRequestTypePrompt, "vegetarian": 9, "nonveg": 10, "vegan": 11},
    { "node": 9, "message": "" + constants.meal.userInput.requesterLocationConfirmPrompt, "confirm": 12, "cancel": 0, "restart": 1},
    { "node": 10, "message": "" + constants.meal.userInput.requesterLocationConfirmPrompt, "confirm": 12, "cancel": 0, "restart": 1},
    { "node": 11, "message": "" + constants.meal.userInput.requesterLocationConfirmPrompt, "confirm": 12, "cancel": 0, "restart": 1},
    { "node": 12, "message": "" + constants.meal.userInput.mealDeliveryConfirmPrompt + constants.meal.userInput.thanksRequestPrompt},
];

// this is used for keep track of visted nodes when we test for loops in the tree
var visited;

// the first node that we will use
var START_NODE = 1;

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, startGameHandlers, askQuestionHandlers, descriptionHandlers);
    alexa.execute();
};

// set state to start up and  welcome the user
var newSessionHandler = {
    'LaunchRequest': function () {
        console.log("LaunchRequest");
        this.handler.state = states.STARTMODE;
        this.emit(':ask', constants.meal.userInput.welcomeMessage, constants.meal.userInput.repeatWelcomeMessage);
    }, 'AMAZON.HelpIntent': function () {
        console.log("HelpIntent");
        this.handler.state = states.STARTMODE;
        this.emit(':ask', constants.meal.userInput.helpMessage, constants.meal.userInput.helpMessage);
    },
    'Unhandled': function () {
        console.log("Unhandled");
        this.handler.state = states.STARTMODE;
        this.emit(':ask', constants.meal.userInput.promptToStartMessage, constants.meal.userInput.promptToStartMessage);
    }
};

// --------------- Functions that control the skill's behavior -----------------------
var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AMAZON.YesIntent': function () {
        this.attributes.currentNode = START_NODE;
        console.log("SettingCurrentNodeSTART_NODE: " + START_NODE);
        console.log("SettingCurrentNode: " + this.attributes.currentNode);

        console.log("AMAZON.YesIntent-startGameHandler");
        // ---------------------------------------------------------------
        // check to see if there are any loops in the node tree - this section can be removed in production code
        visited = [nodes.length];
        console.log("visited: " + visited);
        console.log("visited nodes: " + nodes);
        // var loopFound = helper.debugFunction_walkNode(START_NODE);
        // if( loopFound === true)
        // {
        //     // comment out this line if you know that there are no loops in your decision tree
        //      this.emit(':tell', loopsDetectedMessage);
        // }
        // ---------------------------------------------------------------

        // set state to asking questions
        this.handler.state = states.ASKMODE;

        // ask first question, the response will be handled in the askQuestionHandler
        var message = helper.getSpeechForNode(START_NODE);

        // record the node we are on
        this.attributes.currentNode = START_NODE;

        // ask the first question
        this.emit(':ask', message, message);
    },
    'AMAZON.NoIntent': function () {
        console.log("AMAZON.NoIntent-startGameHandler");
        // Handle No intent.
        this.emit(':tell', constants.meal.userInput.goodbyeMessage);
    },
    'AMAZON.StopIntent': function () {
        console.log("AMAZON.StopIntent-startGameHandler");
        this.emit(':tell', constants.meal.userInput.goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        console.log("AMAZON.CancelIntent-startGameHandler");
        this.emit(':tell', constants.meal.userInput.goodbyeMessage);
    },
    'AMAZON.StartOverIntent': function () {
        console.log("AMAZON.StartOverIntent-startGameHandler");
        this.emit(':ask', constants.meal.userInput.promptToStartMessage, constants.meal.userInput.promptToStartMessage);
    },
    'AMAZON.HelpIntent': function () {
        console.log("AMAZON.HelpIntent-startGameHandler");
        this.emit(':ask', constants.meal.userInput.helpMessage, constants.meal.userInput.helpMessage);
    },
    'MealTypeIntent': function () {
        console.log("MealTypeIntent-startGameHandler");
        helper.yesOrNo(this, 'MealTypeIntent');
    },
    'RequestTypeIntent': function () {
        this.attributes.currentNode = START_NODE;
        console.log("RequestTypeIntent-startGameHandler");
        helper.yesOrNo(this);
    },
    'RequestMealCountIntent': function () {
        console.log("RequestMealCountIntent-startGameHandler");
        helper.yesOrNo(this, 'RequestMealCountIntent');
    },
    'RequestMealIntent': function () {
        console.log("RequestMealIntent-startGameHandler");
        helper.yesOrNo(this, 'RequestMealIntent');
    },
    'DonateMealCountIntent': function () {
        console.log("DonateMealCountIntent-startGameHandler");
        helper.yesOrNo(this, 'DonateMealCountIntent');
    },
    'ConfirmIntent': function () {
        console.log("ConfirmIntent-startGameHandler");
        helper.yesOrNo(this, 'ConfirmIntent');
    },
    'Unhandled': function () {
        console.log("UnhandeledIntent-startGameHandler");
        this.emit(':ask', constants.meal.userInput.promptToStartMessage, constants.meal.userInput.promptToStartMessage);
    }
});

// --------------- Helper Functions  -----------------------
var helper = {
    // logic to provide the responses to the yes or no responses to the main questions
    yesOrNo: function (context, reply) {
        console.log("context.attributes: " + JSON.stringify(context.attributes));
        console.log("context.handler.object: " + JSON.stringify(context));
        var usertype = "DONOR";
        if(context.context.request_type == "Request".toLowerCase()) {
            usertype = "REQUESTER";
        }

        var nextNodeVal = "";
        for (var i in context.event.request.intent.slots) {
            console.log("context.event.request.intent.slots: " + JSON.stringify(context.event.request.intent.slots));
            if (context.event.request.intent.slots.hasOwnProperty(i)) {
                console.log("context.event.request.intent.slots.hasOwnProperty(i): " + JSON.stringify(context.event.request.intent.slots.hasOwnProperty(i)));
                if (context.event.request.intent.slots[i].value) {
                    console.log("context.event.request.intent.slots[i].value: " + JSON.stringify(context.event.request.intent.slots[i].value));
                    nextNodeVal = context.event.request.intent.slots[i].value;
                    console.log("nextNodeVal: " + nextNodeVal);
                    break;
                }
            }
        }

        // this is a question node so we need to see if the user picked yes or no
        var nextNodeId = helper.getNextNode(context.attributes.currentNode, nextNodeVal);

        var msg = helper.getSpeechForNode(nextNodeId);
        var currentDate = new Date().toLocaleString();

        var nodeText = {
            time: currentDate,
            currentIntent: context.event.request.intent.name,
            message: msg,
            reply: reply,
            sessionId: context.event.session.sessionId,
            contextInvokeId: context.context.invokeid
        };

        console.log("context: " + JSON.stringify(context));
        var dateExp = new Date().getTime();
        dateExp += (12 * 60 * 60 * 1000);
        console.log(new Date(dateExp).toUTCString());


        var dbObj = util.constructDbObj(context);

        var nodeJson = JSON.stringify(node);
        var nodeTextJson = JSON.stringify(dbObj);

        if(reply == "confirm" || reply == "ConfirmIntent") {
            processUserOrder(nodeJson, nodeTextJson, dbObj, usertype);
        }

        // error in node data
        if (nextNodeId == -1) {
            context.handler.state = states.STARTMODE;
            context.emit(':tell', constants.meal.userInput.nodeNotFoundMessage, constants.meal.userInput.nodeNotFoundMessage);
        }

        // get the speech for the child node
        var message = helper.getSpeechForNode(nextNodeId);

        // have we made a decision
        if (helper.isAnswerNode(nextNodeId) === true) {
            // set the game state to description mode
            context.handler.state = states.DESCRIPTIONMODE;
            message = message + ' ';
        }

        // set the current node to next node we want to go to
        context.attributes.currentNode = nextNodeId;
        context.emit(':ask', message, message);
    },

    // gets the description for the given node id
    getDescriptionForNode: function (nodeId) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                return nodes[i].description;
            }
        }
        return constants.meal.userInput.descriptionNotFoundMessage + nodeId;
    },

    // returns the speech for the provided node id
    getSpeechForNode: function (nodeId) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                return nodes[i].message;
            }
        }
        return constants.meal.userInput.speechNotFoundMessage + nodeId;
    },

    // checks to see if this node is an choice node or a decision node
    isAnswerNode: function (nodeId) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                if (nodes[i].yes === 0 && nodes[i].no === 0) {
                    return true;
                }
            }
        }
        return false;
    },

    // gets the next node to traverse to based on the response
    getNextNode: function (nodeId, nodeResp) {
        console.log("nodeId-getNextNode: " + nodeId);
        console.log("nodeResp-getNextNode: " + nodeResp);
        console.log("nodes[].node-getNextNode: " + JSON.stringify(nodes));

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                if (nodeResp == "yes") {
                    return nodes[i].yes;
                } else if (nodeResp == "donate") {
                    return nodes[i].donate;
                } else if (nodeResp == "request") {
                    return nodes[i].request;
                } else if (nodeResp == "confirm") {
                    return nodes[i].confirm;
                } else if (nodeResp == "cancel") {
                    return nodes[i].cancel;
                } else if (nodeResp == "restart") {
                    return nodes[i].restart;
                } else if (nodeResp == "five" || nodeResp == "5" ) {
                    return nodes[i].five;
                } else if (nodeResp == "ten" || nodeResp == "10" ) {
                    return nodes[i].ten;
                } else if (nodeResp == "fifty" || nodeResp == "50" ) {
                    return nodes[i].fifty;
                } else if (nodeResp == "no") {
                    return nodes[i].no;
                } else if (nodeResp == "vegetarian") {
                    return nodes[i].vegetarian;
                } else if (nodeResp == "nonveg") {
                    return nodes[i].nonveg;
                } else if (nodeResp == "vegan") {
                    return nodes[i].vegan;
                }
                return nodes[i].no;
            }
        }
        return -1;  // error condition, didnt find a matching  id.
    }
};

function processUserOrder(nodeJson, nodeTextJson, dbAddObj, dbRmvObj, user) {
    console.log("processUserOrder Invoked");
    if(user == "DONOR") {
        util.saveInDB(dbAddObj);
    } else if(user == "REQUESTER") {
        util.removeFromDB(dbRmvObj);
    }
    util.sendWebhook(nodeJson);
    util.testProcessUserOrder();
    util.sendTextNotification(nodeTextJson);
}