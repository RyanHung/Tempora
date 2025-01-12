import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid2, Paper, Avatar, Typography, TextField, Button, Container} from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

export const CreateUserPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

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
      if(email.length < 1) {
        setEmailError("Email must not be empty.")
      }
      else
      {
        setEmailError('');
      }
      if (password.length < 8) {
          setPasswordError("Password must be at least 8 characters long.");
      } else {
          setPasswordError('');
      }

      if (password !== confirmPassword) {
          setConfirmPasswordError("Passwords do not match.");
      } else {
          setConfirmPasswordError('');
      }

      return username.length >= 1 && email.length >= 1 && password.length >= 8 && password === confirmPassword;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
      e.preventDefault();
      if (validateForm()) {
          const checkOptions = {
            method : 'GET',
            headers : {'Content-Type' : 'application/json' }
          };
          const check = await fetch("/api/verify-user/?username=" + username + "&email=" + email + "", checkOptions);  
          if(check.ok)
          {
            const requestOptions = {
                method : 'POST',
                headers : {'Content-Type' : 'application/json' },
                body : JSON.stringify({
                  username : username,
                  email : email,
                  password : password,
                })
              };
              fetch ('/api/create-user', requestOptions).then((response) => response.json()).then((data) => console.log(data));
              console.log('Form submitted');
              navigate("/home");
          }
          else{
            setUsernameError("Username or Email is taken.");
            setEmailError("Username or Email is taken.");
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
                  <h1 style={headerStyle}>Sign Up</h1>
              </Grid2>

              <form onSubmit = {handleSubmit} style={{paddingTop : "20px"}}>
                  <Grid2 container direction="column" spacing={2}>
                      <Grid2 item style={{backgroundColor: "white"}}>
                          <TextField fullWidth label="Username" placeholder="Enter your username" value = {username} onChange={(e) => setUsername(e.target.value)} error = {usernameError !== ''} helperText={usernameError}/>
                      </Grid2>
                      <Grid2 item style={{backgroundColor: "white"}}>
                          <TextField fullWidth label="Email" placeholder="Enter your email" value = {email} onChange={(e) => setEmail(e.target.value)} error = {emailError !== ''} helperText={emailError}/>
                      </Grid2>
                      <Grid2 item style={{backgroundColor: "white"}}>
                          <TextField fullWidth label="Password" placeholder="Enter your password" type="password" value = {password} onChange={(e) => setPassword(e.target.value)} error = {passwordError !== ''} helperText={passwordError}/>
                      </Grid2>
                      <Grid2 item style={{backgroundColor: "white"}}>
                          <TextField fullWidth label="Confirm Password" placeholder="Confirm your password" type="password" value = {confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error = {confirmPasswordError !== ''} helperText={confirmPasswordError}/>
                      </Grid2>
                      <Grid2 item>
                          <Button type="submit" variant="contained" color="primary" fullWidth>
                              Sign up
                          </Button>
                      </Grid2>
                  </Grid2>
              </form>
              <p style={{ textAlign: 'center' }}>
                Already have an account? <a href="/login">Sign in</a>
              </p>
          </Paper>
      </Grid2>
  );
};