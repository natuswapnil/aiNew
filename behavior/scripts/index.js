'use strict'

const getApiCall = require('./lib/getApiCall');
const postApiCall = require('./lib/postApiCall');


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
        var eventData;
        payload = payload || {};
        client.resetConversationState();
        client.updateConversationState({
            isWelecomePromt: true
        });
        client.addResponse('promt/welcome_siya');
        client.addResponse('promt/notify_change');

        eventData = 'Name - ' + (payload.name || '') +
            ' Gender - ' + (payload.gender || '') +
            ' Age - ' + (payload.age || '') +
            ' Contact - ' + (payload.contact || '') + '\n';

        client.updateConversationState({
            userName: payload.name,
            gender: payload.gender,
            age: payload.age,
            contact: payload.contact,
        });

        client.addTextResponse(eventData);
        client.done();

    };

    const isPromtWelocome = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().isWelecomePromt)
        },

        extractInfo() {

        },

        prompt() {
            client.resetConversationState();
            client.updateConversationState({
                isWelecomePromt: true
            });
            client.addResponse('welcome/siya');
            client.addResponse('ask_userdetail/name');
            client.done();
        }
    });

    function updateName(messagePart) {
        var data, name, index, list;
        if (messagePart.content && messagePart.content.toLowerCase().indexOf('my name is ') !== -1 && messagePart.classification.sub_type.value === 'name') {
            index = messagePart.content.toLowerCase().indexOf('my name is ');
            name = messagePart.content.substr(index + 11);
        } else if (messagePart.content && messagePart.content.toLowerCase().indexOf('i am ') !== -1 && messagePart.classification.sub_type.value === 'name') {
            index = messagePart.content.toLowerCase().indexOf('i am ');
            name = messagePart.content.substr(index + 5);
        } else {
            data = messagePart.content.split(' ');
            list = client.getEntities(messagePart, 'name') || { generic: [] };
            name = '';
            list.generic.forEach(function(data) {
                if (data && data.value) {
                    name = name + ' ' + data.value;
                }
            });
            console.log('LIST==========' + JSON.stringify(name));
            if (!name && data.length <= 3 && messagePart.classification.sub_type.value === 'name') {
                name = messagePart.content;
            }


        }
        if (name) {
            client.updateConversationState({
                userName: name
            });

        }
    }

    const collectUserName = client.createStep({
        satisfied() {
            console.log(client.getConversationState().userName);
            return Boolean(client.getConversationState().userName)
        },

        extractInfo() {

            var messagePart = client.getMessagePart();
            console.log(JSON.stringify(messagePart));
            const state = client.getConversationState().state;
            if (state !== 1 || client.getConversationState().userName) {
                return;
            }
            updateName(messagePart);

        },

        prompt() {

            client.updateConversationState({
                state: 1
            });
            client.addResponse('ask_userdetail/name')
            client.done()
        }
    });

    const collectHeight = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().userHeight);
        },

        extractInfo() {
            const userHeight = client.getFirstEntityWithRole(client.getMessagePart(), 'number/number');
            const state = client.getConversationState().state;
            if (state !== 2) {
                return;
            }
            if (userHeight && state === 2) {
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
        }
    });



    const collectWeight = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().userWeight);
        },

        extractInfo() {

            const userWeight = client.getFirstEntityWithRole(client.getMessagePart(), 'number/number');
            const state = client.getConversationState().state;
            if (state !== 3) {
                return;
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
        }
    });

    const needSomeInfo = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().isNeedSomeInfo);
        },

        extractInfo() {

        },

        prompt() {
            client.updateConversationState({
                isNeedSomeInfo: 3,
                state: 2
            });
            client.addResponse('needsomeinfo/user', { name: client.getConversationState().userName });
            client.addResponse('ask_userdetail/height');
            client.done();

        }
    });


    const correctInfo = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().isCorrectInfo);
        },

        extractInfo() {

        },

        prompt() {
            var isPromtChangeDetect = false,
                messagePart = client.getMessagePart();
            var userDetailType, contact, age;

            if (messagePart.classification.base_type.value !== 'decline') {
                userDetailType = client.getFirstEntityWithRole(client.getMessagePart(), 'type');
                if (userDetailType && userDetailType.value.toLowerCase().trim() === 'age') {

                    age = client.getFirstEntityWithRole(client.getMessagePart(), 'number/number');
                    age = age ? age.value : undefined;
                    if (age) {
                        isPromtChangeDetect = true;
                        client.updateConversationState({
                            age: age
                        });
                    }

                }
                contact = client.getFirstEntityWithRole(client.getMessagePart(), 'phone-number/contact');
                if (contact) {

                    contact = contact.value;
                    if (contact) {
                        isPromtChangeDetect = true;
                        client.updateConversationState({
                            contact: contact
                        });
                    }
                }

                if (messagePart.classification.sub_type.value === 'name' || (client.getFirstEntityWithRole(client.getMessagePart(), 'name') && messagePart.classification.base_type.value === 'provide_userdetails')) {
                    updateName(messagePart);
                    isPromtChangeDetect = true;
                }
            }


            client.updateConversationState({
                isCorrectInfo: true
            });
            if (isPromtChangeDetect) {
                client.addResponse('promt/change_detect');
            }

            if (!Boolean(client.getConversationState().userName)) {
                client.updateConversationState({
                    state: 1
                });
                client.addResponse('ask_userdetail/name')
            } else {
                client.updateConversationState({
                    state: 2
                });
                client.addResponse('ask_userdetail/height')
            }
            client.done();

        }
    });



    const getBmi = client.createStep({
        satisfied() {
            return Boolean(client.getConversationState().isBmiCalculated);
        },
        prompt(callback) {
            client.updateConversationState({
                isBmiCalculated: true,
                state: 4
            });


            getApiCall(client.getConversationState().userName, resultBody => {
                // if (!resultBody || resultBody.cod !== 200) {
                //   console.log('Error getting weather.')
                //   callback()
                //   return
                // }

                console.log('sending real data:' + JSON.stringify(resultBody))
                client.addTextResponse(JSON.stringify(resultBody));
                client.done()

                callback()
            })


        }
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
            promptMessage: [isPromtWelocome, correctInfo, collectUserName, collectHeight, collectWeight, getBmi],
            end: [],
        },
    })






}
