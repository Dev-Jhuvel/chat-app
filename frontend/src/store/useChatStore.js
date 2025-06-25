import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useChatStore = create((set) => ({
  message: [],
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
      set({ message: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("Error in getMessages", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  //TODO: optimize 
  setSelectedUser: async (selectedUser) =>set({selectedUser: selectedUser})
}));
