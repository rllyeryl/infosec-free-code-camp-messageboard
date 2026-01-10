'use strict';
const { Thread } = require('../models');

module.exports = function (app) {


  app.route('/api/threads/:board')

    // Create a new thread
    .post(async (req, res) => {
      const { text, delete_password } = req.body;
      const board = req.params.board;
      const now = new Date();

      try {
        const thread = new Thread({
          board,
          text,
          delete_password,
          created_on: now,
          bumped_on: now,
          reported: false,
          replies: []
        });

        const saved = await thread.save();
        res.json(saved);
      } catch (err) {
        res.send('error');
      }
    })

    // View 10 most recent threads
    .get(async (req, res) => {
      const board = req.params.board;

      try {
        const threads = await Thread.find({ board })
          .sort({ bumped_on: -1 })
          .limit(10)
          .lean();

        const cleaned = threads.map(t => {
          delete t.delete_password;
          delete t.reported;

          t.replycount = t.replies.length;
          t.replies = t.replies.slice(-3).map(r => {
            delete r.delete_password;
            delete r.reported;
            return r;
          });

          return t;
        });

        res.json(cleaned);
      } catch (err) {
        res.send('error');
      }
    })

    // Report a thread
    .put(async (req, res) => {
      const { thread_id } = req.body;

      try {
        await Thread.findByIdAndUpdate(thread_id, { reported: true });
        res.send('reported');
      } catch (err) {
        res.send('error');
      }
    })

    // Delete a thread
    .delete(async (req, res) => {
      const { thread_id, delete_password } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (!thread) return res.send('error');

        if (thread.delete_password === delete_password) {
          await Thread.findByIdAndDelete(thread_id);
          res.send('success');
        } else {
          res.send('incorrect password');
        }
      } catch (err) {
