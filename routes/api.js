'use strict';
const { Thread } = require('../models');

module.exports = function (app) {
  
  // --- THREAD ROUTES ---
  app.route('/api/threads/:board')
    .post(async (req, res) => {
      const { text, delete_password } = req.body;
      const board = req.params.board;
      try {
        await Thread.create({
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

    .get(async (req, res) => {
      const board = req.params.board;
      try {
        const threads = await Thread.find({ board: board })
          .sort({ bumped_on: -1 })
          .limit(10)
          .lean();

        const result = threads.map(thread => {
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
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Could not fetch threads" });
      }
    })

    .put(async (req, res) => {
      const { thread_id } = req.body;
      try {
        const updated = await Thread.findByIdAndUpdate(thread_id, { reported: true });
        if (!updated) return res.send("thread not found");
        res.send("reported");
      } catch (err) {
        res.send("error");
      }
    })

    .delete(async (req, res) => {
      const { thread_id, delete_password } = req.body;
      try {
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.send("thread not found");
        if (thread.delete_password === delete_password) {
          await Thread.findByIdAndDelete(thread_id);
          res.send("success");
        } else {
          res.send("incorrect password");
        }
      } catch (err) {
        res.send("error");
      }
    });

  // --- REPLY ROUTES ---
  app.route('/api/replies/:board')
    .post(async (req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;
      const now = new Date();
      try {
        const updated = await Thread.findByIdAndUpdate(thread_id, {
          $set: { bumped_on: now },
          $push: { 
            replies: { text, delete_password, created_on: now, reported: false } 
          }
        });
        if (!updated) return res.send("thread not found");
        res.redirect(`/b/${board}/${thread_id}`);
      } catch (err) {
        res.status(500).send("Error adding reply");
      }
    })
    
    .get(async (req, res) => {
      const thread_id = req.query.thread_id;
      try {
        const thread = await Thread.findById(thread_id).lean();
        if (!thread) return res.json({ error: "no thread found" });
        
        delete thread.delete_password;
        delete thread.reported;
        thread.replies.forEach(reply => {
          delete reply.delete_password;
          delete reply.reported;
        });
        res.json(thread);
      } catch (err) {
        res.status(500).json({ error: "Could not fetch thread" });
      }
    })

    .put(async (req, res) => {
      const { thread_id, reply_id } = req.body;
      try {
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.send("thread not found");
        
        const reply = thread.replies.id(reply_id); // Finding sub-document
        if (!reply) return res.send("reply not found");
        
        reply.reported = true;
        await thread.save();
        res.send("reported");
      } catch (err) {
        res.send("error");
      }
    })

    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      try {
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.send("thread not found");
        
        const reply = thread.replies.id(reply_id);
        if (!reply) return res.send("reply not found");

        if (reply.delete_password === delete_password) {
          reply.text = "[deleted]";
          await thread.save();
          res.send("success");
        } else {
          res.send("incorrect password");
        }
      } catch (err) {
        res.send("error");
      }
    });
};