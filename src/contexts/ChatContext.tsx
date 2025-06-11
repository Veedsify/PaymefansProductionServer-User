import { Message } from "@/types/Components";
import { uniqBy } from "lodash";
import { create } from "zustand";
import _ from "lodash";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  addNewMessage: (newMessage: Message) => void;
  paginateMessages: (newMessages: Message[]) => void;
  setIsTyping: (isTyping: boolean) => void;
}

function setIsTyping(set: (fn: (state: ChatState) => ChatState) => void) {
  return (isTyping: boolean) => {
    set((state) => ({ ...state, isTyping }));
  };
}

function paginateMessages(set: (fn: (state: ChatState) => ChatState) => void) {
  return (newMessages: Message[]) => {
    if (!newMessages) return;
    set((state) => ({
      ...state,
      messages: uniqBy([...state.messages, ...newMessages].reverse(), "id"),
    }));
  };
}

function addNewMessage(set: (fn: (state: ChatState) => ChatState) => void) {
  return (newMessage: Message) => {
    set((state) => ({
      ...state,
      messages: [...state.messages, newMessage],
    }));
  };
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addNewMessage: addNewMessage(set),
  paginateMessages: paginateMessages(set),
  setIsTyping: setIsTyping(set),
}));
