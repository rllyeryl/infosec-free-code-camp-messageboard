'use strict';
const { Thread } = require('../models');

module.exports = function (app) {
  
  // --- THREAD ROUTES ---
  app.route('/api/threads/:board')
    .post(async (req, res) => { /* Your existing code */ })
    .get(async (req, res) => { /* Your existing code */ })
    .put(async (req, res) => { /* Your existing code */ })
    .delete(async (req, res) => { /* Your existing code */ });

  // --- REPLY ROUTES ---
  app.route('/api/replies/:board')
    .post(async (req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;
      const now = new Date();

      try {
        // We find the thread and push the new reply into the array
        // We also "bump" the thread so it moves to the top of the board
        await Thread.findByIdAndUpdate(thread_id, {
          $set: { bumped_on: now },
          $push: { 
            replies: { 
              text, 
              delete_password, 
              created_on: now, 
              reported: false 
            } 
          }
        });
        res.redirect(`/b/${board}/${thread_id}`);
      } catch (err) {
        res.status(500).send("Error adding reply");
      }
    })
    
    .get(async (req, res) => {
      // This is for viewing a SINGLE thread with ALL its replies
      const thread_id = req.query.thread_id;
      try {
        const thread = await Thread.findById(thread_id).lean();
        
        // Hide sensitive fields
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
      // Logic for reporting a specific reply
      const { thread_id, reply_id } = req.body;
      try {
        const thread = await Thread.findById(thread_id);
        const reply = thread.replies.id(reply_id); // Mongoose helper to find sub-doc
        reply.reported = true;
        await thread.save();
        res.send("reported");
      } catch (err) {
        res.send("error");
      }
    })

    .delete(async (req, res) => {
      // Logic for deleting a reply (change text to [deleted])
      const { thread_id, reply_id, delete_password } = req.body;
      try {
        const thread = await Thread.findById(thread_id);
        const reply = thread.replies.id(reply_id);
        
        if (reply.delete_password === delete_password) {
          reply.text = "[deleted]"; // Don't remove it, just change the text
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