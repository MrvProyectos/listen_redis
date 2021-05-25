import { Message, PubSub, Subscription } from '@google-cloud/pubsub';
import { Logger } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { isError } from 'lodash';

require('dotenv').config();

type MessageHandler = (message: Message) => Promise<void>;

export class subServer extends Server implements CustomTransportStrategy {
    constructor(){
        super();

        const buffer = Buffer.from(process.env.GCLOUD_CREDENTIAL_B64, 'base64');
        const credentialDecode = buffer ? buffer.toString() : null;
        const credentialJson = JSON.parse(credentialDecode);

        this.subScriber = new PubSub({
            projectId: this.projectId,
            credentials: credentialJson
        });
    }

    private projectId = process.env.GCLOUD_PROJECT_ID;
    private subScriberName = process.env.GCLOUD_SUBSCRIPTION_NAME;
    private pullLimit = +process.env.GCLOUD_SUBSCRIPTION_PULL_LIMIT;
    // Suscripciones, esto es un objeto de tipo Subscription
    private readonly allSubscriptions: { [subId: string]: Subscription } = {}

    private subScriber: PubSub;

    public readonly logger = new Logger(subServer.name);
    
    listen(callback: () => void){

        const registeredPatterns = [...this.messageHandlers.keys()];
        const subscriberAll = registeredPatterns.map(subId => this.subscribe(subId));

        Promise.all(subscriberAll)
        .then(() => callback())
        .catch(e => this.handleError(e));

        // console.log(`Patterns => ${registeredPatterns}`);
    }

    close() {
        Object.values(this.allSubscriptions).forEach(sub => {
          sub.close().catch(e => this.handleError(e));
        });

    }
    
    // Funcion subscribe
    private async subscribe(subId: string): Promise<void> {

        const typeSuscription = this.subScriberName;
        const getSubcription = await this.getSubscriptions(typeSuscription);
        const handler = this.getMessageHandler(typeSuscription);

        getSubcription.on('message', handler.bind(this));
        getSubcription.on('error', e => this.handleError(e));

        this.allSubscriptions[subId] = getSubcription;

    }

    // funcion getSubscription
    private async getSubscriptions(typeSuscription: string): Promise<Subscription>{
        const gcpSubScription = this.subScriber.subscription(typeSuscription, {
            flowControl: {
                maxMessages: this.pullLimit || 10 
            }
        });

        return gcpSubScription;
    }

    private getMessageHandler(subId: string): MessageHandler {
        return async (message: Message) => {
          const handler = this.getHandlerByPattern(subId);
          if (!handler) {
            this.logger.warn(`No handler for message ${message.id}`);
            message.ack();
            return;
          }
          await handler(message);
        };
      }

    protected handleError(error: any) {
    if (isError(error)) {
        super.handleError(error.stack || error.toString());
    } else {
        super.handleError(error);
    }
    }
    
}