import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
const NoMessages = () => {
  const { dynamicProfile } = useAuthStore();

  const { selectedUser } = useChatStore();

  useEffect(() => {}, [selectedUser]);

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative"></div>
          <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
            <img
              src={
                selectedUser.profilePic ||
                dynamicProfile + selectedUser.fullName
              }
              alt="profile"
              className="rounded-full size-16"
            />
          </div>
        </div>
      </div>
      {/* Welcome Text */}
      <h2 className="text-md md:text-2xl font-bold"> {selectedUser.fullName} </h2>
      <p className="text-sm md:text-md text-center text-base-content/60">
        Send a message and start a conversation.
      </p>
    </div>
  );
};
export default NoMessages;
