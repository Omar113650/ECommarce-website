// import amqp from 'amqplib';

// let connection = null;
// let channel = null;

// const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
// const QUEUE_NAME = 'email_queue';

// export const connectRabbitMQ = async () => {
//   try {
//     console.log('🔗 Connecting to RabbitMQ...');
    
//     connection = await amqp.connect(RABBITMQ_URL);
//     channel = await connection.createChannel();
    
//     // Create queue with options
//     await channel.assertQueue(QUEUE_NAME, {
//       durable: true, // Queue persists even if RabbitMQ restarts
//       arguments: {
//         'x-max-priority': 10, // Enable priority (0-10)
//       }
//     });

//     console.log('✅ RabbitMQ Connected Successfully');
//     console.log(`📬 Queue "${QUEUE_NAME}" is ready`);

//     // Handle connection errors
//     connection.on('error', (err) => {
//       console.error('❌ RabbitMQ Connection Error:', err.message);
//       setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
//     });

//     connection.on('close', () => {
//       console.log('⚠️ RabbitMQ Connection Closed. Reconnecting...');
//       setTimeout(connectRabbitMQ, 5000);
//     });

//   } catch (error) {
//     console.error('❌ Failed to connect to RabbitMQ:', error.message);
//     console.log('🔄 Retrying in 5 seconds...');
//     setTimeout(connectRabbitMQ, 5000);
//   }
// };

// export const getChannel = () => {
//   if (!channel) {
//     throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ() first.');
//   }
//   return channel;
// };

// export const closeRabbitMQ = async () => {
//   try {
//     if (channel) await channel.close();
//     if (connection) await connection.close();
//     console.log('✅ RabbitMQ Connection Closed Gracefully');
//   } catch (error) {
//     console.error('❌ Error closing RabbitMQ:', error.message);
//   }
// };

// # RABBITMQ_URL=amqp://guest:guest@localhost:5672


