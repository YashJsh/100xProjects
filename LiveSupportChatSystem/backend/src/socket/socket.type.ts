export enum EventTypes{
    JOIN_CONVERSATION,
    SEND_MESSAGE,
    LEAVE_CONVERSATION,
    CLOSE_CONVERSATION,
    NEW_MESSAGE,
    CONVERSATION_CLOSED,
    ERROR,
}

export interface Message<T>{
    event : EventTypes,
    data : T
}