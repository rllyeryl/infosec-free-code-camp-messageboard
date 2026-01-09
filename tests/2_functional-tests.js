const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Variables to store IDs for use in subsequent tests
  let testThreadId;
  let testReplyId; 
  const testBoard = 'test_board';

  suite('Routing Tests', function() {

    // 1. CREATE THREAD
    test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
      chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({ text: 'Chai Test Thread', delete_password: 'test_password' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    // 2. VIEW THREADS
    test('Viewing the 10 most recent threads: GET request to /api/threads/{board}', function(done) {
      chai.request(server)
        .get(`/api/threads/${testBoard}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          testThreadId = res.body[0]._id; // Capture ID for deletion/reporting
          assert.property(res.body[0], '_id');
          assert.notProperty(res.body[0], 'delete_password');
          done();
        });
    });

    // 3. DELETE THREAD (WRONG PASS)
    test('Deleting a thread with incorrect password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId, delete_password: 'wrong' })
        .end(function(err, res) {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    // 4. REPORT THREAD
    test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
      chai.request(server)
        .put(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.text, 'reported');
          done();
        });
    });

    // 5. DELETE THREAD (CORRECT PASS)
    test('Deleting a thread with correct password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId, delete_password: 'test_password' })
        .end(function(err, res) {
          assert.equal(res.text, 'success');
          done();
        });
    });

  });
});