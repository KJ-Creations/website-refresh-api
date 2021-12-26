const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This section will help you get a list of all the records.
recordRoutes.route("/listings").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("users")
    .find({})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400);
        res.json({
          status: "failed",
          statusCode: 1,
          error: err,
        });
      } else {
        res.status(200);
        res.json({
          status: "success",
          statusCode: 0,
          data: result,
        });
      }
    });
});

// This section will help you create a new record.
recordRoutes.route("/listings").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const matchDocument = {
    userId: req.body.userId,
    username: req.body.username,
  };

  dbConnect
    .collection("users")
    .insertOne(matchDocument, function (err, result) {
      if (err) {
        res.status(400);
        res.json({
          status: "failed",
          statusCode: 1,
          error: err,
        });
      } else {
        console.log(`Added a new match with id`);
        res.status(200);
        res.json({
          status: "success",
          statusCode: 0,
        });
      }
    });
});

// This section will help you update a record by id.
recordRoutes.route("/listings/update").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const listingQuery = { userId: req.body.userId };
  const updates = {
    $set: {
      username: req.body.username,
    },
  };

  dbConnect
    .collection("users")
    .updateOne(
      listingQuery,
      updates,
      { upsert: true },
      function (err, _result) {
        if (err) {
          res.status(400);
          res.json({
            status: "failed",
            statusCode: 1,
            error: err,
          });
        } else {
          res.status(200);
          res.json({
            status: "success",
            statusCode: 0,
          });
        }
      }
    );
});

// This section will help you delete a record
recordRoutes.route("/listings/delete/:id").delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { userId: req.params.id };

  dbConnect
    .collection("users")
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res.status(400);
        res.json({
          status: "failed",
          statusCode: 1,
          error: err,
        });
      } else {
        res.status(200);
        res.json({
          status: "success",
          statusCode: 0,
        });
      }
    });
});

module.exports = recordRoutes;
