import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";
import logo from "../assets/logo.svg";

export const useChatStore = create((set, get) => {
  const sound = new Audio("/sounds/notify.mp3");

  return {
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const response = await axiosInstance.get("/messages/users");
        set({ users: response.data });
        //   toast.success('Users loaded.')
      } catch (error) {
        toast.error(error.message);
        console.log("Error in getUser", error);
      } finally {
        set({ isUsersLoading: false });
      }
    },

    getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const response = await axiosInstance.get(`messages/${userId}`);
        set({ messages: response.data });
      } catch (error) {
        toast.error(error.response.data.message);
        console.log("Error in getMessages", error);
      } finally {
        set({ isMessagesLoading: false });
      }
    },

    sendMessage: async (messageData) => {
      const { selectedUser, messages } = get();
      try {
        const response = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          messageData
        );
        set({ messages: [...messages, response.data] });
      } catch (error) {
        toast.error(error.response.statusText);
      }
    },

    unlockAudio: async () => {
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Sound Played Successfully!");
          })
          .catch((error) => {
            let textError =
              error.name === "NotAllowedError"
                ? "Not Allowed"
                : `Playback failed, ${error}`;
            console.log(textError);
          });
      } else {
        console.warn("Browser returned undefined from play()!");
      }
    },

    notifyForMessage: async (newMessage) => {
      const { users } = get();
      users.forEach((user) => {
        if (user._id === newMessage.senderId) {
          let notifText = `${user.fullName}: ${newMessage.text}`;
          const options = {
            body: notifText,
            icon: logo,
            badge: logo,
            image: newMessage,
            tag: newMessage._id,
            renotify: true,
            requireInteraction: true,
          };
          if (newMessage.image) {
            options.image = newMessage.image;
            options.body = `${user.fullName} sent an image`;
            notifText = `${user.fullName} sent an image`;
          }
          if ("serviceWorker" in navigator && "Notification" in window) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  reg.showNotification(
                    `New Message From ${user.fullName}`,
                    options
                  );
                } else {
                  get().unlockAudio();
                  toast(notifText, {
                    duration: 4000,
                    position: "top-right",
                    icon: "💌",
                  });
                }
              });
            });
          } else if (!("Notification" in window)) {
            get().unlockAudio();
            toast(notifText, {
              duration: 4000,
              position: "top-right",
              icon: "💌",
            });
          }
        }
      });
    },

    subscribeToMessages: () => {
      const { selectedUser } = get();
      if (!selectedUser) return;
      const socket = useAuthStore.getState().socket;
      socket.on("newMessage", (newMessage) => {
        const isMessageSentFromSelectedUser =
          newMessage.senderId === selectedUser._id;
        if (isMessageSentFromSelectedUser) {
          set({ messages: [...get().messages, newMessage] });
        } else {
          get().notifyForMessage(newMessage);
        }
      });
    },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
    },

    setSelectedUser: async (user) => {
      set({ selectedUser: user });
    },
  };
});
