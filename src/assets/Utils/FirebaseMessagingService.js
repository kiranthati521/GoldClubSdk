import messaging from '@react-native-firebase/messaging';

class MyFirebaseMessagingService {
    onMessageReceived(remoteMessage) {
        console.log('A new message arrived!', remoteMessage);
        // Handle the message, display a notification, etc.
    }
}

// Register the service
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});

export default MyFirebaseMessagingService;
