import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid2, Paper, Avatar, Typography, TextField, Button, Container} from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const paperStyle = { padding: '50px 20px', width: 300, margin: "0 auto", backgroundColor : "#D3D3D3"};
    const headerStyle = { margin: 0, "font-family" : "Helvetica"};
    const avatarStyle = { backgroundColor: 'gray', width : 100, height : 100, marginBottom : 10};
    const marginTop = { marginTop: 5 };

    const navigate = useNavigate();

    // Validate password and confirm password
    const validateForm = () => {
      if(username.length < 1) {
        setUsernameError("Username must not be empty.")
      }
      else
      {
        setUsernameError('');
      }
      if (password.length < 8) {
          setPasswordError("Password must be at least 8 characters long.");
      } else {
          setPasswordError('');
      }
      return username.length >= 1 && password.length >= 8;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
      e.preventDefault();
      if (validateForm()) {
          const checkOptions = {
            method : 'GET',
            headers : {'Content-Type' : 'application/json' }
          };
          const check = await fetch("/api/login/?username=" + username + "&password=" + password + "", checkOptions);  
          if(check.ok)
          {
            console.log('Form submitted');
            navigate("/");
          }
          else{
            setUsernameError("Username/Password is not recognized.");
            setPasswordError("Username/Password is not recognized.");
            console.log('Form is invalid');
          }
      } else {
          console.log('Form is invalid');
      }
  };

    return (
      <Grid2 container spacing={2} justifyContent="center" align style={{width: '100vw', paddingTop:"30px"}}>
          <Paper elevation={20} style={paperStyle}>
              <Grid2 align="center">
                  <Avatar style={avatarStyle}>
                  <AccountCircleRoundedIcon sx={{ color: 'white', transform: 'scale(3)' }} />
                  </Avatar>
                  <h1 style={headerStyle}>Login</h1>
              </Grid2>

              <form onSubmit = {handleSubmit} style={{paddingTop : "20px"}}>
                  <Grid2 container direction="column" spacing={2}>
                      <Grid2 item style={{backgroundColor: "white"}}>
                          <TextField fullWidth label="Username" placeholder="Enter your username" value = {username} onChange={(e) => setUsername(e.target.value)} error = {usernameError !== ''} helperText={usernameError}/>
                      </Grid2>
                      <Grid2 item style={{backgroundColor: "white"}}>
                          <TextField fullWidth label="Password" placeholder="Enter your password" type="password" value = {password} onChange={(e) => setPassword(e.target.value)} error = {passwordError !== ''} helperText={passwordError}/>
                      </Grid2>

                      <Grid2 item>
                          <Button type="submit" variant="contained" color="primary" fullWidth>
                              Login
                          </Button>
                      </Grid2>
                  </Grid2>
              </form>

              <p style={{ textAlign: 'center' }}>
                Don't have an account? <a href="/create-user">Create one</a>
              </p>
          </Paper>
      </Grid2>
  );
};