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









    const handleWelocomeEvent = function(eventType, payload) {
        client.resetConversationState();
        client.updateConversationState({
            isWelecomePromt: true
        });
        client.addResponse('welcome/siya');
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
                });

            }
        },

        prompt() {
            
            client.updateConversationState({
                state: 1
            });
            client.addResponse('ask_userdetail/name')
            client.done()
        },
    });

    const collectHeight = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().userHeight);
        },

        extractInfo() {
            const userHeight = client.getFirstEntityWithRole(client.getMessagePart(), 'number/number');
            const state = client.getConversationState().state;
            if(state ){
            console.log( 'userHeight:'+JSON.stringify(userHeight)+' state:'+state);
            }
            if (userHeight &&  state === 2 ) {
                client.updateConversationState({
                    userHeight: userHeight
                });
            }
        },

        prompt() {
             client.updateConversationState({
                state: 2
            });
            client.addResponse('ask_userdetail/height');
            client.done();
        },
    });



    const collectWeight = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().userWeight);
        },

        extractInfo() {
         
           const userWeight = client.getFirstEntityWithRole(client.getMessagePart(), 'number/number');
           const state = client.getConversationState().state;
            if(state ){
            console.log( 'weight:'+userWeight+' state:'+state);
            }
            if (userWeight && state == 3) {
                client.updateConversationState({
                    userWeight: userWeight
                });
            }
        },

        prompt() {
          client.updateConversationState({
                state: 3
            });
            client.addResponse('ask_userdetail/weight');
            client.done();
        },
    });

    const needSomeInfo = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().isNeedSomeInfo)
        },

        extractInfo() {

        },

        prompt() {
          client.updateConversationState({
                isNeedSomeInfo: 3
            });
          client.addResponse('needsomeinfo/user');
            client.done();
          
        },
    });





    client.runFlow({
        eventHandlers: {
            'welcome:siya': handleWelocomeEvent
        },

        autoResponses: {
            // configure responses to be automatically sent as predicted by the machine learning model
        },
        streams: {
            main: 'promptMessage',
            promptMessage: [isPromtWelocome, collectUserName, needSomeInfo,collectHeight, collectWeight],
            end: [],
        },
    })






}
