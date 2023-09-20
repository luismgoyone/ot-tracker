import { useState, useEffect } from 'react';
import './App.css';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

function App() {
  const [credentials, setCredentials] = useState();
  const [user, setUser] = useState({});

  useEffect(() => {
    if (credentials && credentials.credential) {
      const decodedUser = jwt_decode(credentials.credential);
      setUser(decodedUser);
    }
  }, [credentials]);

  console.log(user);
  return (
    <>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          setCredentials(credentialResponse);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </>
  );
}

export default App;
