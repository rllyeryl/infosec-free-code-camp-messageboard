'use strict';
const { Thread } = require('../models');

module.exports = function (app) {
  
  // --- THREAD ROUTES ---
  app.route('/api/threads/:board')
    .get(async (req, res) => {
      // Logic for getting 10 recent threads
    })
    .post(async (req, res) => {
      const { text, delete_password } = req.body;
      const board = req.params.board;
      try {
        const newThread = await Thread.create({
          board: board,
          text: text,
          delete_password: delete_password,
          replies: []
        });
        res.redirect(`/b/${board}/`);
      } catch (err) {
        res.status(500).send("Error creating thread");
      }
    })
    .put(async (req, res) => {
      // Logic for reporting a thread
    })
    .delete(async (req, res) => {
      // Logic for deleting a thread
    });

  // --- REPLY ROUTES ---
  app.route('/api/replies/:board')
    .get(async (req, res) => {
      // Logic for viewing a single thread with all replies
    })
    .post(async (req, res) => {
      // Logic for creating a new reply
    })
    .put(async (req, res) => {
      // Logic for reporting a reply
    })
    .delete(async (req, res) => {
      // Logic for deleting a reply
    });

};