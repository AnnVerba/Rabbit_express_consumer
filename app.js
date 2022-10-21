var createError = require('http-errors');
var express = require('express');
var app = express();
var amqp = require('amqplib/callback_api');


var args=process.argv.slice(2)
amqp.connect('amqp://localhost:5672', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = 'hello';
    channel.assertExchange("exchange1", 'topic', {
      durable: true
    });
    channel.bindQueue('hello','hello','user.info#')
    channel.assertQueue(queue, {
      durable: false
    }, function(error2, q) {
      channel.prefetch(1);
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

      args.forEach(function(key) {
        channel.bindQueue(q.queue, 'exchange', key);
      });
      channel.consume(queue, function(msg) {
        console.log(" [x] Received %s", msg.fields.routingKey,msg.content.toString());
        channel.sendToQueue('hello', Buffer.from(msg.content.toString()), {
          replyTo: 'hello'
        });
      }, {
        noAck: true
      });
    });
  });
});

module.exports = app;
