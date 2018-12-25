import firebase from 'firebase/app';
import 'firebase/auth';
// import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';
import {FIREBASE_API_KEY} from './config/apiKeys.js';

var config = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "react-slack-clone-8ca74.firebaseapp.com",
    databaseURL: "https://react-slack-clone-8ca74.firebaseio.com",
    projectId: "react-slack-clone-8ca74",
    storageBucket: "react-slack-clone-8ca74.appspot.com",
    messagingSenderId: "11138008141"
  };

  firebase.initializeApp(config);

  export default firebase;
