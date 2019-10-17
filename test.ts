import { PubSub, Message } from '@google-cloud/pubsub';
import { randomBytes } from 'crypto';

// USE A GOOGLE PROJECT YOU HAVE ACCESS TO
const GOOGLE_PROJECT_ID = '[INSERT_PROJECT_ID]';

const topicName = `test-topic-${randomBytes(4).toString('hex')}`;
const subscriptionName = `test-sub-${randomBytes(4).toString('hex')}`;

// 10 messages will be published, only 2 should process concurrently
const publishCount = 10;
const maxMessages = 2;

const pubsub = new PubSub({ projectId: GOOGLE_PROJECT_ID });

// Async test func
(async () => {
    const [topic] = await pubsub.topic(topicName).get({ autoCreate: true });
    const [subscription] = await topic.createSubscription(subscriptionName, { flowControl: { maxMessages }, });

    let processingCount = 0;
    let firstMessageReceived = false;

    subscription.on('message', (message: Message) => {
        firstMessageReceived = true;

        // increment our concurrency count
        processingCount++;

        setTimeout(() => {
            // decrement our concurrency count and ack message
            processingCount--;
            message.ack();
        }, 1000)
        message.ack();
    });

    // Validator
    setInterval(() => {
        if (processingCount > maxMessages) {
            console.log(`ERROR: Concurrently processing ${processingCount} messages (flowControl.maxMessages = ${maxMessages})`)
        } else {
            console.log(`Concurrency within tolerances`)
        }

        if (firstMessageReceived && processingCount === 0) { // Cleanup code
            console.log(`Deleting test topic: ${topicName}`)
            topic.delete().then(() => process.exit(0));
        }
    }, 500)

    // Publish several messages into the topic
    for (let i = 0; i < publishCount; i++) {
        topic.publishJSON({ id: i });
    }
})();

