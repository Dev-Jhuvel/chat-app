import  {useChatStore} from "../store/useChatStore";
import {useEffect} from 'react'; 
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
const ChatContainer = () => {
  const {messages, getMessages, isMessagesLoading, selectedUser} = useChatStore;

  useEffect(() =>{
   if(selectedUser){
     getMessages(selectedUser._id);
   }
  },[selectedUser, getMessages]);

  if(isMessagesLoading) return <div>Loading...</div>


  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader/>
      <p>messages...</p>
      <MessageInput/>
    </div>
  )
};
export default ChatContainer;
