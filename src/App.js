import './css/App.css';
import Gun from 'gun';
import SEA from 'gun/sea';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {useEffect} from 'react';

import Chatting from './Chatting';
import Login from './Login';

const gun = Gun({
  // relay node
  peers: ['http:localhost:8000/gun']
})

function App() {

  const testSEA = async () => {
    const pair = await SEA.pair(); // 공개키 - 개인키 생성 epub: 암호화된 공개키, epriv: 암호화된 개인키, pub: 공개키, priv: 개인키
    console.log(pair);
    const encrypt = await SEA.encrypt('wotjr', pair); // 데이터를 공개키 - 개인키인 pair로 암호화
    console.log("SEA.decrypt: ", await SEA.decrypt(encrypt, pair)); // 암호화된 데이터를 암호화할 때 사용되었던 공개키 - 개인키인 pair로 복호화
    const data = await SEA.sign(encrypt, pair); // 암호화된 데이터에 서명을 해서 공격을 방지한다.
    console.log("asign sign data: ", data);
  }

  useEffect(() => {
    // testSEA();
  }, [])

  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login gun={gun}/>}/>
          <Route path="/chat" element={<Chatting gun={gun}/>}/>
        </Routes>
      </BrowserRouter>
    </div> 
  );
}

export default App;
