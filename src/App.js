import './App.css';
import Gun from 'gun';
import SEA from 'gun/sea';

import {useState, useEffect} from 'react';

const gun = Gun({
  // relay node
  peers: ['http:localhost:8000/gun']
})

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

  useEffect(() => {
    testSEA();
    // gun.get('text').once((node) => {
    //   console.log("node: ", node);
    //   if(node === undefined) {
    //     gun.get('text').put({text: "Write any text"})
    //   } else {
    //     console.log("Found node");
    //     setText(node.text);
    //   }
    // })

    // gun.get('text').on((node, res) => {
    //   console.log("Receving update");
    //   console.log("node2:" ,node);
    //   console.log('text.on.res: ', res);
    //   setText(node.text);
    // })

    // gun.get('text').get('hello').off((ack) => {
    //   console.log("ack:", ack);
    // })
  }, [])

  const updateText = (e) => {
    console.log("Updating text");
    console.log(e.target.value);
    gun.get('text').put({text: e.target.value});
    setText(e.target.value);
  }

  return (
    <div className="App">
      <h1>React With GunJS</h1>
      <textarea value = {text} onChange = {updateText}/>
    </div>
  );
}

export default App;
