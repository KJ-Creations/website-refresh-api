const express = require("express");
const { convert } = require("html-to-text");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const siteRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This section will help you get a list of all the records.
siteRoutes.route("/site").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("sites")
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

siteRoutes.route("/site/byUser/:user").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("sites")
    .find({ userId: req.params.user })
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

siteRoutes.route("/site/bySite/:site").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("sites")
    .find({ siteId: req.params.site })
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
siteRoutes.route("/site").post(function (req, res) {
  const dbConnect = dbo.getDb();
  fetch(req.body.url)
    .then(async (response) => {
      var responseText = await response.text();
      // console.log(responseText);
      // res.status(200);
      // res.send(responseText);

      const text = convert(responseText, {
        selectors: [{ selector: "img", format: "skip" }],
        ignoreHref: true,
      }).replace(/\n/g, "");
      const matchDocument = {
        siteId: req.body.siteId,
        url: req.body.url,
        userId: req.body.userId,
        email: req.body.email,
        before: text,
        after: text,
        notified: false,
      };

      dbConnect
        .collection("sites")
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
    })
    .catch((error) => {
      console.log(error);
    });
});

// This section will help you update a record by id.
siteRoutes.route("/site/update").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const listingQuery = { siteId: req.body.siteId };
  const updates = {
    $set: {
      url: req.body.url,
      userId: req.body.userId,
      email: req.body.email,
      before: req.body.before,
      after: req.body.after,
      notified: req.body.notified,
    },
  };

  dbConnect
    .collection("sites")
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

siteRoutes.route("/site/refresh").post(function (req, res) {
  fetch(req.body.url).then(async (response) => {
    const dbConnect = dbo.getDb();
    const listingQuery = { siteId: req.body.siteId };
    responseText = await response.text();
    const text = convert(responseText, {
      selectors: [{ selector: "img", format: "skip" }],
      ignoreHref: true,
    }).replace(/\n/g, "");

    const updates = {
      $set: {
        before: text,
        after: text,
        notified: false,
      },
    };

    dbConnect
      .collection("sites")
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
});

// This section will help you delete a record
siteRoutes.route("/site/delete/:id").delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { siteId: req.params.id };

  dbConnect
    .collection("sites")
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

module.exports = siteRoutes;
