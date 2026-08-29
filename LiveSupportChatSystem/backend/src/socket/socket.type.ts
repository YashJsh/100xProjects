export enum EventTypes {
    JOIN_CONVERSATION = "join_conversation",
    SEND_MESSAGE = "send_message",
    LEAVE_CONVERSATION = "leave_conversation",
    CLOSE_CONVERSATION = "close_conversation",
    NEW_MESSAGE = "new_message",
    CONVERSATION_CLOSED = "conversation_closed",
    ERROR = "error",
}

export interface Message<T>{
    event : EventTypes,
    data : T
}

export interface ServerToClientPayload{
    event : EventTypes.NEW_MESSAGE,
    data : {
        conversationId : string,
        senderId : string,
        senderRole : string,
        content : string,
        createdAt : string
    }
}


export interface ErrorPayload{
    event : EventTypes.ERROR,
    data : {
        message : string
    }
}

export interface ConversationClosedPayload {
    event: EventTypes.CONVERSATION_CLOSED,
    data: {
        conversationId: string,
        closedBy: string
    }
}