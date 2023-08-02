export const enum MessageType {
  REGISTER = 'reg',
  UPDATE_WINNERS = 'update_winners',
  CREATE_ROOM = 'create_room',
  ADD_USER = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
  FINISH = 'finish',
}

export const enum ServerMessageMode {
  SEND = 'SEND',
  BROADCAST = 'BROADCAST',
  BROADCAST_SELECTIVE = 'BROADCAST_SELECTIVE',
  BROADCAST_SELECTIVE_CYCLE_DATA = 'BROADCAST_SELECTIVE_CYCLE_DATA',
}

export const enum AttackResult {
  MISS = 'miss',
  KILLED = 'killed',
  SHOT = 'shot',
}

export const enum ShipType {
  HUGE = 'huge',
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small',
}
