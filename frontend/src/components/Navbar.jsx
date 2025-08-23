import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { MessageSquare, User, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { logout, authUser, isLoggingOut } = useAuthStore();
  const { users, selectedUser, notifyForMessage } = useChatStore();

  useEffect(() => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        if (selectedUser._id !== newMessage.senderId) {
          notifyForMessage(newMessage);
          return () => {
            socket.off("newMessage");
          };
        }
      });
    }
  }, [users, notifyForMessage, selectedUser]);

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex item-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 transition-all ">
              <div className="size-9 rounded-lg flex items-center justify-center">
                <MessageSquare className="size-8 text-primary hover:text-secondary"></MessageSquare>
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/settings"
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="size-4"></Settings>
              <span className="hideen sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-5"></User>
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  className="flex gap-2 items-center"
                  disabled={isLoggingOut}
                  onClick={logout}
                >
                  <LogOut className="size-5"></LogOut>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
