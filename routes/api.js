'use strict';
const { Thread } = require('../models');

module.exports = function (app) {
  
  // --- THREAD ROUTES ---
  app.route('/api/threads/:board')
    .get(async (req, res) => {
      const board = req.params.board;
      try {
        const threads = await Thread.find({ board: board })
          .sort({ bumped_on: -1 })
          .limit(10)
          .lean();

        const formattedThreads = threads.map(thread => {
          delete thread.delete_password;
          delete thread.reported;
          thread.replycount = thread.replies.length;
          thread.replies = thread.replies
            .sort((a, b) => b.created_on - a.created_on)
            .slice(0, 3)
            .map(reply => {
              delete reply.delete_password;
              delete reply.reported;
              return reply;
            });
          return thread;
        });
        res.json(formattedThreads);
      } catch (err) {
        res.status(500).json({ error: "Could not fetch threads" });
      }
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
    .put(async (req, res) => { /* To be implemented */ })
    .delete(async (req, res) => { /* To be implemented */ });


  // --- REPLY ROUTES ---
  app.route('/api/replies/:board')
    .get(async (req, res) => {
      const { thread_id } = req.query; // Single thread view uses query param
      try {
        const thread = await Thread.findById(thread_id).lean();
        if (!thread) return res.send("Thread not found");

        // Hide sensitive fields
        delete thread.delete_password;
        delete thread.reported;
        thread.replies = thread.replies.map(reply => {
          delete reply.delete_password;
          delete reply.reported;
          return reply;
        });

        res.json(thread);
      } catch (err) {
        res.send("Error fetching thread");
      }
    })
    .post(async (req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;
      const now = new Date();

      try {
        const updatedThread = await Thread.findByIdAndUpdate(
          thread_id,
          {
            $set: { bumped_on: now }, // "Bump" the thread to the top
            $push: { 
              replies: { 
                text, 
                delete_password, 
                created_on: now 
              } 
            }
          },
          { new: true }
        );
        res.redirect(`/b/${board}/${thread_id}`);
      } catch (err) {
        res.status(500).send("Error posting reply");
      }
    });
};