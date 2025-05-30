import { create } from 'zustand';

type CommentAttachmentContext = {
    attachments: number[];
    addNewAttachment: (attachment: number) => void;
    removeAttachment: (attachment: number) => void;
};

export const useCommentIdContext = create<CommentAttachmentContext>((set) => ({
    attachments: [],
    addNewAttachment: (attachment: number) => set((state) => ({ attachments: [...state.attachments, attachment] })),
    removeAttachment: (attachment: number) => set((state) => ({ attachments: state.attachments.filter((a) => a !== attachment) }))
}));