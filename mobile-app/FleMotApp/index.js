/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';


import { GoogleSignin } from '@react-native-google-signin/google-signin';


import { firebase } from '@react-native-firebase/app';

if (firebase.apps.length === 0) {
  firebase.initializeApp();
}

GoogleSignin.configure({
  webClientId: '321890167840-pagqb07euvhs5nuppni2t6kl0ftf5388.apps.googleusercontent.com',
});

AppRegistry.registerComponent(appName, () => App);