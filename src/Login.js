import './css/Login.css';
import { useState, useEffect } from 'react';
import SEA from 'gun/sea';

function Login({gun}) {
    const user = gun.user().recall({sessionStorage: true});

    const [userForm, setUserForm] = useState({
        alias: "",
        password: "",
    });

    const [loginState, setLoginState] = useState(false);

    const onChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value,
        });
    };

    const submit = () => {
        user.create(userForm.alias, userForm.password, (res) => {
            console.log(res);
        });

        setUserForm({
            alias: "",
            password: "",
        });
    };

    const loginBtn = () => {
        user.auth(userForm.alias, userForm.password, (res) => {
            console.log("loginBtn: ", res);
            setLoginState(true);
        })

        setUserForm({
            alias: "",
            password: "",
        })
    }

    const logoutBtn = async () => {
        await user.leave((res)=> {
            console.log('logoutBtn: ', res);
            setLoginState(false);
        })
    }

    const checkBtn = () => {
        console.log(user);
        gun.on('auth', (ack) => {
            console.log('Authentication was successful: ', ack);
        })
    }

    const decryptUser = async () => {
        console.log(user._.sea);
        if(user.is) {
            console.log(await SEA.decrypt(user.is.alias, user._.sea));
        }
    }

    useEffect(() => {
        decryptUser();
        gun.user(user.is.pub).once(console.log);
    }, [])

    return (
        <div className="login">
            {user.is ? 
                <div>
                    Welcome! 
                    <button onClick={logoutBtn}>Logout</button>
                    <button onClick={checkBtn}>Check</button>
                </div>:
                <div>
                    <h1>Hey! Login or join our service 😆</h1>
                    <input
                        onChange={onChange}
                        placeholder="Alias"
                        name="alias"
                        value={userForm.alias}
                    />
                    <input
                        onChange={onChange}
                        placeholder="Password"
                        name="password"
                        value={userForm.password}
                    />
                    <button onClick={submit}>Join</button>
                    <button onClick={loginBtn}>Login</button>
                    <button onClick={logoutBtn}>Logout</button>
                    <button onClick={checkBtn}>Check</button>
            </div>}
            
        </div>
    )
}

export default Login;