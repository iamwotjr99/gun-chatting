import './css/Chatting.css';
import {useState, useEffect, useReducer} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';

const initialState = {
    messages: [],
  }
  
const reducer = (state1, message) => {
  console.log("state1111:", state1.messages);
   return {
     messages: [message, ...state1.messages],
   }
 }

function Chatting({ gun }) {
  const { state } = useLocation();

  const navigate = useNavigate();

  const user = gun.user().recall({sessionStorage: true});
  console.log('user:', user);

  const [roomState, setRoom] = useState("");
  let room;

  const [originalHash, setOriginalHash] = useState("");
  const [firstHash, setFirstHash] = useState("");

  const onChangeRoom = (e) => {
    room = e.target.value;
  };

  const onResetRoom = () => {
    setRoom(room);
  };

  const onHashMessage = async () => {
    const wholeMessages = gun.put(roomState);
    console.log(wholeMessages._.graph);
    const hash = CryptoJS.SHA256(JSON.stringify(wholeMessages._.graph)).toString();

    if(originalHash !== hash) {
      axios.post(`http://203.247.240.236:1206/api/recordhash`, {
        "RoomNumber": roomState,
        "HostID": state.alias,
        "DateTime": Date().toLocaleString(),
        "Hash": hash
      }).then((res) => {
        onQuery();
        window.alert("Hash Recorded: \n" + res.data.Hash);
        console.log(res.data.Hash);
      });
    };
  };

  function onQuery(roomState) {
    axios.get(`http://203.247.240.236:1206/api/query/${roomState}`).then((res) => {
      console.log(res);
      setOriginalHash(res.data.Hash);
    })
  }

  function onChainQuery() {
    console.log(roomState);
    axios.get(`http://203.247.240.236:1206/api/query${roomState}`).then((res) => {
      console.log(res);
      if(res.data !== "Yet") {
        setOriginalHash(res.data.Hash);
      } else {
        window.alert("First Time Record");
        console.log(res);
      }
    })
  }

  const [formState, setForm] = useState({
    message: "",
  });

  const [state1, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("useEffect Hook ");
    const messages = gun.get(roomState);
    console.log(messages);
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
    const createdAt = new Date().toLocaleString();
    messages.set({
      name: state.alias,
      message: formState.message,
      createdAt: createdAt,
    });
    setForm({
      message: "",
    })
  }

  const logoutBtn = async () => {
    await user.leave().then(() => {
      navigate('/');
    })
  }

  return (
    <div className="chatting">
      <div className='chat_user_info'>
        userName: {state.alias}
        <button onClick={logoutBtn}>logout</button>
      </div>
      <b>Welcome to joining ✨✨ {roomState} 👩‍👧‍👧</b>
      <div>
        <input onChange={onChangeRoom} placeholder="Room" name="room" />
        <button onClick={onResetRoom}>Join Room</button>
      </div>
      <input
        onChange={onChange}
        placeholder="Message"
        name="message"
        value={formState.message}
      />
      <button onClick={saveMessage}>Send Message</button>
      {state1.messages.map((message, createdAt) => (
        <div key={createdAt}>
          <h2>{message.message}</h2>
          <h3>From: {message.name}</h3>
          <p>Date: {message.createdAt}</p>
        </div>
      ))}
      <div>
        <button onClick={onHashMessage}>Recording on message</button>
        <button onClick={onChainQuery}>Query Hash</button>
      </div>
    </div>
  );
}

export default Chatting;