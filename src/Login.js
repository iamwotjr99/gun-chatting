import './css/Login.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEA from 'gun/sea';

function Login({gun}) {
    const user = gun.user().recall({sessionStorage: true});

    const navigate = useNavigate();

    const [userForm, setUserForm] = useState({
        alias: "",
        password: "",
    });

    const [alias, setAlias] = useState("");
    

    useEffect(() => {
        if(user.is) {
            gun.user(user.is.pub).once((res) => {
                console.log("userInfo for pub", res);
                setAlias(res.alias);
            });
        }
    }, [])

    const onChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value,
        });
    };

    const submit = async () => {
        await user.create(userForm.alias, userForm.password, (res) => {
            console.log(res);
        });

        setUserForm({
            alias: "",
            password: "",
        });
    };

    const loginBtn = async () => {
        await user.auth(userForm.alias, userForm.password, (res) => {
            console.log("loginBtn: ", res);
            if(!res.err) {
                navigate('/chat', {state: {
                    alias: res.put.alias,
                    pub: res.put.pub
                }});
            }

            setUserForm({
                alias: "",
                password: "",
            })
        })

    }

    const logoutBtn = async () => {
        await user.leave((res)=> {
            console.log('logoutBtn: ', res);
        })

        window.location.reload();
        console.log('logout');
    }

    const checkBtn = () => {
        console.log(user);
        gun.on('auth', (ack) => {
            console.log('Authentication was successful: ', ack);
        })
    }


    return (
        <div className="login">
            {user.is ? 
                <div>
                    Welcome! 
                    {alias}
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