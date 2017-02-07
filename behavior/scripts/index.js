'use strict'

exports.handle = (client) => {
    // Create steps
    const sayHello = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().helloSent)
        },

        prompt() {
            client.addResponse('welcome')
            client.addResponse('provide/documentation', {
                documentation_link: 'http://docs.init.ai',
            })
            client.addResponse('provide/instructions')

            client.updateConversationState({
                helloSent: true
            })

            client.done()
        }
    })

    const untrained = client.createStep({
        satisfied() {
            return false
        },

        prompt() {
            client.addResponse('apology/untrained')
            client.done()
        }
    })


    const collectHeight = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().userHeight);
        },

        extractInfo() {
            const userHeight = client.getFirstEntityWithRole(client.getMessagePart(), 'number/number');
            console.log('swapnil userHeight:' + userHeight);
            if (userHeight) {
                client.updateConversationState({
                    userHeight: userHeight
                })
            }
        },

        prompt() {

            client.addResponse('ask_userdetail/height');
            client.done();
        },
    });



    const handleWelocomeEvent = function(eventType, payload) {
        client.resetConversationState();
        client.updateConversationState({
            isWelecomePromt: true
        });
        //  client.addResponse('welcome/siya');
        client.addResponse('ask_userdetail/name');
        client.done();

    };

    const isPromtWelocome = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().isWelecomePromt)
        },

        extractInfo() {

        },

        prompt() {},
    });


    const collectUserName = client.createStep({
        satisfied() {
            console.log(client.getConversationState().userName);
            return Boolean(client.getConversationState().userName)
        },

        extractInfo() {
            const name = client.getFirstEntityWithRole(client.getMessagePart(), 'name')
            if (name) {
                client.updateConversationState({
                    userName: name
                })
            }
        },

        prompt() {
            client.addResponse('ask_userdetail/name')
            client.done()
        },
    });

    client.runFlow({
        eventHandlers: {
            'welcome:siya': handleWelocomeEvent
        },
        classifications: {
            'welcome/siya': 'promptMessage'
        },
        autoResponses: {
            // configure responses to be automatically sent as predicted by the machine learning model
        },
        streams: {
            main: 'promptMessage',
            promptMessage: [isPromtWelocome, collectUserName, collectHeight],
            end: [untrained],
        },
    })
}
