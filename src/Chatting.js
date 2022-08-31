import './css/Chatting.css';
import {useState, useEffect, useReducer} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import SEA from 'gun/sea';

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
    const currentRoom = gun.get(room)
    currentRoom.get('users').set(state);
  };

  const onHashMessage = async () => {
    const wholeMessages = gun.put(roomState);
    console.log("wholeMessages: ", wholeMessages);
    console.log(wholeMessages._.graph);
    console.log("encryptMessage: ", await SEA.encrypt(wholeMessages._.graph, user._.sea));
    const hash = CryptoJS.SHA256(JSON.stringify(wholeMessages._.graph)).toString();

    if(originalHash !== hash) {
      axios.post(`http://203.247.240.236:1206/api/recordhash`, {
        "RoomNumber": roomState,
        "HostID": state.alias,
        "DateTime": Date().toLocaleString(),
        "Hash": hash
      }).then((res) => {
        console.log("onHashMessage axios Post: ", res);
        onQuery();
        window.alert("Hash Recorded: \n" + res.data.Hash);
        console.log(res.data.Hash);
      });
    };
  };

  function onQuery(roomState) {
    axios.get(`http://203.247.240.236:1206/api/query/${roomState}`).then((res) => {
      console.log("onQuery Axios Get: ", res);
      setOriginalHash(res.data.Hash);
    })
  }

  function onChainQuery() {
    console.log(roomState);
    const wholeMessages = gun.put(roomState);
    console.log("onChainQuery whole Messages: ", wholeMessages._.graph);
    const hash = CryptoJS.SHA256(JSON.stringify(wholeMessages._.graph)).toString();
    axios.get(`http://203.247.240.236:1206/api/query/${roomState}`).then((res) => {
      console.log("onChainQuery axios Get: ", res);
      console.log("Recorded Hash", res.data.Hash, "Now Hash", hash);
      window.alert("Recorded Hash" + res.data.Hash + "Now Hash" + hash);
    })
  }

  const [formState, setForm] = useState({
    message: "",
  });

  const [stateMsg, dispatch] = useReducer(reducer, initialState);

  const test = async () => {
    console.log(await SEA.encrypt('awd', user._.sea));
  }

  useEffect(() => {
    // test();
    console.log("useEffect Hook ");
    const messages = gun.get(roomState);
    const users = gun.get(roomState).get("users");
    console.log("users in room:", users);
    console.log("roomState:", messages);
    messages.map().once(async (m) => {
      console.log("each message:", m);
      const encryptedMsg = await SEA.encrypt(m, user._.sea.epub);
      console.log(encryptedMsg);
      dispatch({
        name: m.name,
        message: m.message,
        createdAt: m.createdAt
      });
    });
    users.map().once((u) => {
      console.log("each user:", u);
    });
    onQuery();
  }, [roomState])

  function onChange(e) {
    setForm({
      ...formState,
      [e.target.name]: e.target.value
    });
  }

  function saveMessage() {
    const messages = gun.get(roomState);
    console.log("in saveMessage:", messages);
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
      {stateMsg.messages.map((message, createdAt) => (
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