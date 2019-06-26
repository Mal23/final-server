require('dotenv').config();
const request = require('supertest');
const app = require('../lib/app');
const mongoose = require('mongoose');
const Comment = require('../lib/models/Comment');
const connect = require('../lib/utils/connect');

jest.mock('../lib/middleware/ensure-auth.js');

const createCommentHelper = (body, characterId = '1234') => {
  return Comment.create({ body, characterId, email: 'test@test.com' })
    .then(comment => JSON.parse(JSON.stringify(comment)));
};

describe('comments routes test', () => {
  beforeAll(() => {
    return connect();
  });

  beforeEach(() => {
    mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('can post a comment', () => {
    return request(app)
      .post('/api/v1/comments')
      .send({ body: 'I am a comment', characterId: '1234' })
      .then(res => {
        expect(res.body).toEqual({
          body: 'I am a comment',
          characterId: '1234',
          __v: 0,
          _id: expect.any(String),
          email: 'test@test.com'
        });
      });
  });

  it('can get all comments', async() => {
    const comments = await Promise.all(
      [...Array(10)]
        .map((_, i) => createCommentHelper(`Comment ${i}`)));
    return request(app)
      .get('/api/v1/comments/')
      .then(res => {
        comments.forEach(comment => {
          expect(res.body).toContainEqual(comment);
        });
      });
  });
  
  it('can get comments by characterId', async() => {
    const comments = await Promise.all(
      [...Array(10)]
        .map((_, i) => createCommentHelper(`Comment ${i}`)));
    return request(app)
      .get('/api/v1/comments/1234')
      .then(res => {
        expect(res.body).toHaveLength(10);
        expect(comments).toHaveLength(10);
      });
  });

  it('returns email with a comment', () => {
    return Comment
      .create({ 
        body: 'I am a comment', 
        characterId: '1234', 
        email: 'test@test.com' 
      })
      .then(() => {
        return request(app)
          .get('/api/v1/comments/');
      })
      .then(res => {
        expect(res.body).toEqual([{
          __v: 0,
          _id: expect.any(String),
          body: 'I am a comment',
          characterId: '1234',
          email: 'test@test.com'
        }]);
      });
  });
  
  it('deletes a comment by id', () => {
    return Comment
      .create({ 
        body: 'I am a comment', 
        characterId: '1234', 
        email: 'test@test.com' 
      })
      .then(comment => {
        return request(app)
          .delete(`/api/v1/comments/${comment._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          __v: 0,
          _id: expect.any(String),
          body: 'I am a comment',
          characterId: '1234',
          email: 'test@test.com'
        });
      });
  });

  it('updates comment by id', () => {
    return Comment
      .create({ 
        body: 'I am an updated comment', 
        characterId: '1234', 
        email: 'test@test.com' 
      })
      .then(res => {
        return request(app)
          .put(`/api/v1/comments/${res._id}`)
          .send({ 
            body: 'I am an updated comment', 
            characterId: '1234',
            email: 'test@test.com' 
          });
      })
      .then(res => {
        expect(res.body).toEqual({
          __v: 0,
          _id: expect.any(String),
          body: 'I am an updated comment',
          characterId: '1234',
          email: 'test@test.com'
        });
      });
  });
});
