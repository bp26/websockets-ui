import request from 'superwstest';
import server from '..';
import { MessageType } from '../types/enums';

const formMessage = (type: MessageType, data: unknown) => {
  return {
    type,
    data: JSON.stringify(data),
    id: 0,
  };
};

describe('Registration', () => {
  const expectedName = 'Aleksey';
  const expectedType = MessageType.REGISTER;

  const message = formMessage(expectedType, {
    name: expectedName,
    password: 'correct',
  });

  const incorrectMessage = formMessage(expectedType, {
    name: expectedName,
    password: 'incorrect',
  });

  beforeEach((done) => {
    server.listen(0, 'localhost', done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('Returns correct data upon registration', async () => {
    await request(server)
      .ws('/path/ws')
      .sendJson(message)
      .expectJson(({ type, data }) => {
        expect(type).toEqual(expectedType);
        expect(typeof data).toEqual('string');

        const { name, index, error } = JSON.parse(data);

        expect(name).toEqual(expectedName);
        expect(typeof index).toEqual('string');
        expect(error).toEqual(false);
      });
  });

  it('Returns error upon login with wrong password', async () => {
    await request(server)
      .ws('/path/ws')
      .sendJson(incorrectMessage)
      .expectJson(({ data }) => {
        const { error, errorText } = JSON.parse(data);

        expect(error).toEqual(true);
        expect(errorText).toBeTruthy();
      });
  });

  it('Returns error if user already online', async () => {
    await request(server).ws('/path/ws').sendJson(message);
    await request(server)
      .ws('/path/ws')
      .sendJson(message)
      .expectJson(({ data }) => {
        const { error, errorText } = JSON.parse(data);

        expect(error).toEqual(true);
        expect(errorText).toBeTruthy();
      });
  });
});
