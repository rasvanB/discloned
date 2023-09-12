import { create } from "zustand";

type Modal =
  | {
      type: "none";
      state: null;
    }
  | {
      type: "createGuild";
      state: null;
    }
  | {
      type: "createChannel";
      state: {
        guildId: string;
      };
    }
  | {
      type: "deleteServer";
      state: {
        guildId: string;
      };
    }
  | {
      type: "leaveServer";
      state: {
        guildId: string;
      };
    }
  | {
      type: "inviteMember";
      state: {
        guildId: string;
      };
    }
  | {
      type: "chatAttachment";
      state: null;
    };

type ModalStore = {
  modal: Modal;
  isOpen: boolean;
  onOpen: (modal: Modal) => void;
  onClose: () => void;
};

export const useModal = create<ModalStore>((set) => ({
  modal: {
    type: "none",
    state: null,
  },
  isOpen: false,
  onOpen: (modal) => set({ modal, isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
