import './css/Chatting.css';
import {useState, useEffect, useReducer} from 'react';

const initialState = {
    messages: [],
  }
  
const reducer = (state, message) => {
   return {
     messages: [message, ...state.message],
   }
 }

function Chatting({ gun }) {
  const [roomState, setRoom] = useState("");
  let room;
  const onChangeRoom = (e) => {
    room = e.target.value;
  };
  const onResetRoom = () => {
    setRoom(room);
  };

  const [formState, setForm] = useState({
    name: "",
    message: "",
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("useEffect Hook ");
    const messages = gun.get(roomState);
    messages.map().once((m) => {
      console.log(m);
      dispatch({
        name: m.name,
        message: m.message,
        createdAt: m.createdAt
      });
    });
  }, [roomState])

  function onChange(e) {
    setForm({
      ...formState,
      [e.target.name]: e.target.value
    });
  }

  function saveMessage() {
    const messages = gun.get(roomState);
        messages.set({
        name: formState.name,
        message: formState.message,
        createdAt: Date.now(),
        });
        setForm({
        name: "",
        message: "",
        })
  }

  return (
    <div className="chatting">
      <b>Welcome to joining ✨✨ {roomState} 👩‍👧‍👧</b>
      <div>
        <input onChange={onChangeRoom} placeholder="Room" name="room" />
        <button onClick={onResetRoom}>Join Room</button>
      </div>
      <input
        onChange={onChange}
        placeholder="Name"
        name="name"
        value={formState.name}
      />
      <input
        onChange={onChange}
        placeholder="Message"
        name="message"
        value={formState.message}
      />
      <button onClick={saveMessage}>Send Message</button>
      {state.messages.map((message, createdAt) => (
        <div key={createdAt}>
          <h2>{message.message}</h2>
          <h3>From: {message.name}</h3>
          <p>Date: {message.createdAt}</p>
        </div>
      ))}
      <div>
        <button>Recording on message</button>
        <button>Query Hash</button>
      </div>
    </div>
  );
}

export default Chatting;