import './css/Login.css';
import { useState } from 'react';


function Login({gun}) {
    const user = gun.user();

    const [userForm, setUserForm] = useState({
        alias: "",
        password: "",
    });

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
    return (
        <div className="login">
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
            <button onClick={submit}>Submit</button>
        </div>
    )
}

export default Login;