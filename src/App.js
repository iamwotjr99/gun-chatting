import './App.css';
import Gun from 'gun';
import SEA from 'gun/sea';

import {useState, useEffect, useReducer} from 'react';

const gun = Gun({
  // relay node
  peers: ['http:localhost:8000/gun']
})

const initialState = {
  messages: [],
}

const reducer = (state, message) => {
  return {
    messages: [message, ...state.message],
  }
}

function App() {

  const [text, setText] = useState();

  const testSEA = async () => {
    const pair = await SEA.pair(); // 공개키 - 개인키 생성 epub: 암호화된 공개키, epriv: 암호화된 개인키, pub: 공개키, priv: 개인키
    console.log(pair);
    const encrypt = await SEA.encrypt('wotjr', pair); // 데이터를 공개키 - 개인키인 pair로 암호화
    console.log("SEA.decrypt: ", await SEA.decrypt(encrypt, pair)); // 암호화된 데이터를 암호화할 때 사용되었던 공개키 - 개인키인 pair로 복호화
    const data = await SEA.sign(encrypt, pair); // 암호화된 데이터에 서명을 해서 공격을 방지한다.
    console.log("asign sign data: ", data);
  }

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
    testSEA();
    
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

  const updateText = (e) => {
    console.log("Updating text");
    console.log(e.target.value);
    gun.get('text').put({text: e.target.value});
    setText(e.target.value);
  }

  return (
    <div style={{ padding: 30 }}>
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

export default App;
