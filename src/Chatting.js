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
  console.log("stateMsg:", stateMsg.messages);
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
    console.log("useEffect Hook ");
    onQuery();
    getUserList();
    getMessage();
    console.log("userList: ", userList);
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
    let encryptAlias = await SEA.encrypt(state.alias, myPair.epub);
    let encryptMessage = await SEA.encrypt(formState.message, myPair.epub);
    let encryptTime = await SEA.encrypt(createdAt, myPair.epub);
    console.log('save Message epub Key: ', myPair.epub);
    // const signAlias = await SEA.sign(encryptAlias, myPair);
    // const signMessage = await SEA.sign(encryptMessage, myPair);
    // const singTime = await SEA.sign(encryptTime, myPair);
    await messages.set({
      name: encryptAlias,
      message: encryptMessage,
      createdAt: encryptTime
    });
    setForm({
      message: "",
    })
  }

  function getMessage() {
    const messages = gun.get(roomState);
    console.log("roomState: ", messages);
    messages.map().once(async (msg) => {
      console.log("each message: ", msg);
      if(msg !== undefined) {
        userList.map(async (user) => {
          // let veriMessage = await SEA.verify(msg.message, user.pub);
          // let veriAlias = await SEA.verify(msg.name, user.pub);
          // let veriTime = await SEA.verify(msg.createdAt, user.pub);
          let decryptedMessage = await SEA.decrypt(msg.message, user.epub);
          let decryptedAlias = await SEA.decrypt(msg.name, user.epub);
          let decryptedTime = await SEA.decrypt(msg.createdAt, user.epub);
          if(decryptedAlias !== undefined) {
            dispatch({
              name: decryptedAlias,
              message: decryptedMessage,
              createdAt: decryptedTime,
            });
          }
        });
      }
      // const verifiedMsg = await SEA.verify(m, myPair);
      // console.log("verify message by user pub: ", verifiedMsg);
      // let decryptedAlias = await SEA.decrypt(m.name, myPair.epub);
      // let decryptedMessage = await SEA.decrypt(m.message, myPair.epub);
      // let decryptedTime = await SEA.decrypt(m.createdAt, myPair.epub);
      // console.log('get Message epub Key: ', myPair.epub);
      // // const encryptedMsg = await SEA.encrypt(m, myPair.epub);
      // console.log("decrypted message by user pub: ", decryptedMessage);
      // // console.log("encrypted message by user epub: ", encryptedMsg);
      // dispatch({
      //   name: decryptedAlias,
      //   message: decryptedMessage,
      //   createdAt: decryptedTime,
      // });
    });
  }

  function getUserList() {
    const users = gun.get(roomState).get("user");
    users.map().once((user) => {
      console.log("each user: ", user);
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
    console.log("wholeMessages: ", wholeMessages);
    console.log(wholeMessages._.graph);
    console.log("encryptMessage: ", await SEA.encrypt(wholeMessages._.graph, myPair));
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