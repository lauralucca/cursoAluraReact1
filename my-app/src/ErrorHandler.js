import PubSub from 'pubsub-js';

export default class ErrorHandler {
    publicaErros(errosJSON) {
        for(var i = 0; i < errosJSON.errors.length; i++) {
            var erro = errosJSON.errors[i];
            PubSub.publish("erro-validacao", erro);
        }
    }
}