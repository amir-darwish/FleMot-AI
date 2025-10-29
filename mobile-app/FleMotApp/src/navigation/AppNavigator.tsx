// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DrawerNavigator from './DrawerNavigator';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
    const { userToken, userLanguage, isLoading } = useAuth();

    if (isLoading) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {}
            {!userToken ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </>
                ) :

                !userLanguage ? (
                    <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                ) : (

                    <Stack.Screen name="AppDrawer" component={DrawerNavigator} />
                )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
