const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testThreadId;
  let testReplyId;
  const testBoard = 'test_board';

  suite('Routing Tests', function() {

    // --- THREAD TESTS ---
    test('1. Creating a new thread: POST request to /api/threads/{board}', function(done) {
      chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({ text: 'Thread for testing', delete_password: 'pass' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test('2. Viewing the 10 most recent threads: GET request to /api/threads/{board}', function(done) {
      chai.request(server)
        .get(`/api/threads/${testBoard}`)
        .end((err, res) => {
          assert.isArray(res.body);
          testThreadId = res.body[0]._id; // Save for later
          done();
        });
    });

    test('3. Reporting a thread: PUT request to /api/threads/{board}', function(done) {
      chai.request(server)
        .put(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId })
        .end((err, res) => {
          assert.equal(res.text, 'reported');
          done();
        });
    });

    // --- REPLY TESTS ---
    test('4. Creating a new reply: POST request to /api/replies/{board}', function(done) {
      chai.request(server)
        .post(`/api/replies/${testBoard}`)
        .send({ thread_id: testThreadId, text: 'Test reply', delete_password: 'reply_pass' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test('5. Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
      chai.request(server)
        .get(`/api/replies/${testBoard}`)
        .query({ thread_id: testThreadId })
        .end((err, res) => {
          assert.property(res.body, 'replies');
          testReplyId = res.body.replies[0]._id; // Save for deletion
          done();
        });
    });

    test('6. Reporting a reply: PUT request to /api/replies/{board}', function(done) {
      chai.request(server)
        .put(`/api/replies/${testBoard}`)
        .send({ thread_id: testThreadId, reply_id: testReplyId })
        .end((err, res) => {
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('7. Deleting a reply with incorrect password: DELETE request to /api/replies/{board}', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'wrong' })
        .end((err, res) => {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('8. Deleting a reply with correct password: DELETE request to /api/replies/{board}', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'reply_pass' })
        .end((err, res) => {
          assert.equal(res.text, 'success');
          done();
        });
    });

    // --- FINAL DELETION TESTS ---
    test('9. Deleting a thread with incorrect password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId, delete_password: 'wrong' })
        .end((err, res) => {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('10. Deleting a thread with correct password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId, delete_password: 'pass' })
        .end((err, res) => {
          assert.equal(res.text, 'success');
          done();
        });
    });

  });
});