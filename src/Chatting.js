import './css/Chatting.css';
import {useState, useEffect, useReducer} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import SEA from 'gun/sea';

const initialState = {
    messages: [],
  }
  
const reducer = (stateMsg, message) => {
   return {
     messages: [message, ...stateMsg.messages],
   }
 }

function Chatting({ gun }) {
  const { state } = useLocation();

  const navigate = useNavigate();

  const user = gun.user().recall({sessionStorage: true});
  const myPair = user._.sea;

  const [roomState, setRoom] = useState("");
  let room;

  const [userList, setUserList] = useState([]);

  const [originalHash, setOriginalHash] = useState("");
  const [firstHash, setFirstHash] = useState("");

  const onChangeRoom = (e) => {
    room = e.target.value;
  };

  const onResetRoom = () => {
    setRoom(room);
    const currentRoom = gun.get(room)
    currentRoom.get('user').get(state.alias).put(state);
    console.log(user);
  };

  const [formState, setForm] = useState({
    message: "",
  });

  const [stateMsg, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    onQuery();
    getUserList();
    getMessage();
  }, [roomState, userList])

  function onChange(e) {
    setForm({
      ...formState,
      [e.target.name]: e.target.value
    });
  }

  async function saveMessage() {
    const messages = gun.get(roomState);
    const createdAt = new Date().toLocaleString();
    const encryptAlias = await SEA.encrypt(state.alias, myPair.epub);
    const encryptMessage = await SEA.encrypt(formState.message, myPair.epub);
    const encryptTime = await SEA.encrypt(createdAt, myPair.epub);
    const signAlias = await SEA.sign(encryptAlias, myPair);
    const signMessage = await SEA.sign(encryptMessage, myPair);
    console.log(signMessage);
    const singTime = await SEA.sign(encryptTime, myPair);
    await messages.set({
      name: signAlias,
      message: signMessage,
      createdAt: singTime
    });
    setForm({
      message: "",
    })
  }

  function getMessage() {
    const messages = gun.get(roomState);
    const users = gun.get(roomState).get("user");
    messages.map().once(async (msg) => {
      
      users.map().once(async (user) => {
        const veriMessage = await SEA.verify(msg.message, user.pub);
        const veriAlias = await SEA.verify(msg.name, user.pub);
        const veriTime = await SEA.verify(msg.createdAt, user.pub);
        const decryptedAlias = await SEA.decrypt(veriAlias, user.epub);
        const decryptedMessage = await SEA.decrypt(veriMessage, user.epub);
        const decryptedTime = await SEA.decrypt(veriTime, user.epub);
        if(decryptedAlias !== undefined) {
          dispatch({
            name: decryptedAlias,
            message: decryptedMessage,
            createdAt: decryptedTime,
          });
        }
      });
    });
  }

  function getUserList() {
    const users = gun.get(roomState).get("user");
    users.map().once((user) => {
      userList.push(user);
    })
  }

  const logoutBtn = async () => {
    await user.leave().then(() => {
      navigate('/');
    })
  }

  const onHashMessage = async () => {
    const wholeMessages = gun.put(roomState);
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
      });
    };
  };

  function onQuery(roomState) {
    axios.get(`http://203.247.240.236:1206/api/query/${roomState}`).then((res) => {
      setOriginalHash(res.data.Hash);
    })
  }

  function onChainQuery() {
    const wholeMessages = gun.put(roomState);
    const hash = CryptoJS.SHA256(JSON.stringify(wholeMessages._.graph)).toString();
    axios.get(`http://203.247.240.236:1206/api/query/${roomState}`).then((res) => {
      window.alert("Recorded Hash" + res.data.Hash + "Now Hash" + hash);
    })
  }

  return (
    <div className="chatting">
      <div className='chat_user_info'>
        <b>user Name: {state.alias}</b>
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
      {userList[0] ? <div className='chat_people'>
        <b>User in {roomState} =&gt; &nbsp;
        {userList.map((user) => {
          return (
            user.alias + "  "
          )
        })}</b>
      </div> : <div></div>}
      {stateMsg.messages.map((message, createdAt) => (
        <div key={createdAt}>
          {message.message ? 
            <div>
              <h2>{message.message}</h2>
              <h3>From: {message.name}</h3>
              <p>Date: {message.createdAt}</p>
            </div> 
              : <div></div>
          }
          
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