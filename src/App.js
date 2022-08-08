import './App.css';
import Gun from 'gun';

import {useState, useEffect} from 'react';

const gun = Gun({
  // relay node
  peers: ['http:localhost:8000/gun']
})

function App() {

  const [text, setText] = useState();

  useEffect(() => {
    gun.get('text').once((node) => {
      console.log(node);
      if(node === undefined) {
        gun.get('text').put({text: "Write any text"})
      } else {
        console.log("Found node");
        setText(node.text);
      }
    })

    gun.get('text').on((node) => {
      console.log("Receving update");
      console.log(node)
      setText(node.text);
    })
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
