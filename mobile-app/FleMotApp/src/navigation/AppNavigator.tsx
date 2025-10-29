import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DrawerNavigator from './DrawerNavigator'; // الملف الموجود حاليًا عندك

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
    const { userToken, isLoading } = useAuth();

    if (isLoading) return null; // يمكن استبدالها بمكون LoadingIndicator

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken == null ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                </>
            ) : (
                <Stack.Screen name="AppDrawer" component={DrawerNavigator} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
