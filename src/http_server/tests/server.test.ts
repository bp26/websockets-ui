import request, { WSChain } from 'superwstest';
import server from '..';
import { MessageType } from '../types/enums';

const playerName = 'Aleksey';
const playerPassword = 'password';

const formMessage = (type: MessageType, data: unknown) => {
  return {
    type,
    data: JSON.stringify(data),
    id: 0,
  };
};

const register = (ws: WSChain, name: string): WSChain =>
  ws
    .sendJson(
      formMessage(MessageType.REGISTER, {
        name,
        password: playerPassword,
      })
    )
    .expectJson()
    .expectJson()
    .expectJson();

describe('Registration functionality', () => {
  const expectedType = MessageType.REGISTER;

  const message = formMessage(MessageType.REGISTER, {
    name: playerName,
    password: playerPassword,
  });

  const incorrectMessage = formMessage(MessageType.REGISTER, {
    name: playerName,
    password: 'incorrect',
  });

  beforeEach((done) => {
    server.listen(0, 'localhost', done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it(`Returns correct registration data upon registration`, async () => {
    await request(server)
      .ws('/path/ws')
      .sendJson(message)
      .expectJson(({ type, data }) => {
        expect(type).toEqual(expectedType);
        expect(typeof data).toEqual('string');

        const { name, index, error } = JSON.parse(data);

        expect(name).toEqual(playerName);
        expect(typeof index).toEqual('string');
        expect(error).toEqual(false);
      });
  });

  it(`Returns error upon login with wrong password (message 'reg')`, async () => {
    await request(server)
      .ws('/path/ws')
      .sendJson(incorrectMessage)
      .expectJson(({ data }) => {
        const { error, errorText } = JSON.parse(data);

        expect(error).toEqual(true);
        expect(errorText).toBeTruthy();
      });
  });

  it(`Returns rooms and winners data upon registration`, async () => {
    await request(server)
      .ws('/path/ws')
      .sendJson(message)
      .expectJson()
      .expectJson(({ type, data }) => {
        expect(type).toEqual(MessageType.UPDATE_ROOM);

        expect(JSON.parse(data)).toEqual([]);
      })
      .expectJson(({ type, data }) => {
        expect(type).toEqual(MessageType.UPDATE_WINNERS);

        expect(JSON.parse(data)).toEqual([]);
      });
  });
});

describe('Room functionality', () => {
  beforeEach((done) => {
    server.listen(0, 'localhost', done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('Returns updated room data (user already in the created room) upon creating a room', async () => {
    const registeredRequest = register(request(server).ws('/path/ws'), playerName);
    await registeredRequest.sendJson(formMessage(MessageType.CREATE_ROOM, '')).expectJson(({ type, data }) => {
      expect(type).toEqual(MessageType.UPDATE_ROOM);

      const parsedData = JSON.parse(data);
      expect(Array.isArray(parsedData)).toBeTruthy();
      expect(parsedData.length).toEqual(1);

      const { roomId, roomUsers } = parsedData[0];

      expect(typeof roomId).toEqual('string');
      expect(Array.isArray(roomUsers)).toBeTruthy();
      expect(roomUsers.length).toEqual(1);

      const { name } = roomUsers[0];
      expect(name).toEqual(playerName);
    });
  });
});
