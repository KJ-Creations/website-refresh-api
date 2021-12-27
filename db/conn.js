const { MongoClient } = require("mongodb");
const { convert } = require("html-to-text");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const connectionString = process.env.ATLAS_URI;
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }
      dbConnection = db.db("website_refresh");
      console.log("Successfully connected to MongoDB.");

      setInterval(() => {
        dbConnection
          .collection("sites")
          .find()
          .toArray(async (err, result) => {
            if (err) {
            } else {
              for (var i = 0; i < result.length; i++) {
                if (result[i].before != result[i].after) {
                  if (!result[i].notified) {
                    const listingQuery = { siteId: result[i].siteId };
                    const updates = {
                      $set: {
                        notified: true,
                      },
                    };
                    await dbConnection
                      .collection("sites")
                      .updateOne(
                        listingQuery,
                        updates,
                        { upsert: true },
                        function (err, _result) {
                          if (err) {
                            console.log("Error Sending Data");
                          } else {
                            console.log("Sent Notification");
                          }
                        }
                      );
                  }
                } else {
                  let res1 = result[i];
                  fetch(result[i].url)
                    .then(async (response) => {
                      responseText = await response.text();
                      const text = convert(responseText, {
                        selectors: [{ selector: "img", format: "skip" }],
                        ignoreHref: true,
                      }).replace(/\n/g, "");
                      // console.log(responseText);
                      if (text != res1.before) {
                        console.log("SET AFTER");
                        const listingQuery = { siteId: res1.siteId };
                        const updates = {
                          $set: {
                            after: text,
                          },
                        };
                        await dbConnection
                          .collection("sites")
                          .updateOne(
                            listingQuery,
                            updates,
                            { upsert: true },
                            function (err, _result) {
                              if (err) {
                                console.log("Error Sending Data");
                              } else {
                                console.log("Updated After");
                              }
                            }
                          );
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                }
              }
            }
          });
      }, 5000);

      return callback();
    });
  },

  getDb: function () {
    return dbConnection;
  },

  refreshDb: function () {},
};
