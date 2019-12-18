const fetch = require("node-fetch");
var AWS = require("aws-sdk");
const cnf = {
  method: "POST",
  body:
    "ciclop=202010&cup=D&majrp=INCO&crsep=I7038&materiap=&horaip=&horafp=&edifp=&aulap=&ordenp=0&mostrarp=100"
};
exports.handler = async function(event, context) {
  return new Promise((resolve, reject) => {
    fetch("http://consulta.siiau.udg.mx/wco/sspseca.consulta_oferta", cnf).then(
      response => {
        response.text().then(html => {
          const iNRC = html.indexOf(103847);
          const i = html.indexOf("OLIVA NAVARRO, DIEGO ALBERTO");
          const shorterStr = html.slice(
            iNRC,
            i + "OLIVA NAVARRO, DIEGO ALBERTO".length
          );
          let regex = /tddatos/gi,
            result,
            indices = [];
          while ((result = regex.exec(shorterStr))) {
            indices.push(result.index);
          }
          const x = shorterStr.slice(indices[5]);
          const f = x.indexOf("</TD>");
          const r = x.slice("tddatos".length + 1, f);
          if (r != 0) {
            AWS.config = new AWS.Config();
            AWS.config.accessKeyId = "ACCESS_KEY";
            AWS.config.secretAccessKey = "SECRET";
            AWS.config.update({ region: "us-east-1" });

            // Create publish parameters
            var params = {
              Message:
                "Ya hay cupos para inteligencia artificial" /* required */,
              TopicArn: "ARN"
            };

            // Create promise and SNS service object
            var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
              .publish(params)
              .promise();

            // Handle promise's fulfilled/rejected states
            publishTextPromise
              .then(function(data) {
                resolve(
                  `Message ${params.Message} send sent to the topic ${params.TopicArn}`
                );
              })
              .catch(function(err) {
                reject(err.message);
              });
          } else {
            resolve("Aun no hay");
          }
        });
      }
    );
  });
};
