import React, { useContext } from 'react';
import {
  ActivityIndicator as NativeActivityIndicator,
  Alert as NativeAlert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as NativePressable,
  SafeAreaView as NativeSafeAreaView,
  ScrollView as NativeScrollView,
  StatusBar as NativeStatusBar,
  Text as NativeText,
  TextInput as NativeTextInput,
  View as NativeView,
} from 'react-native';
import { LinearGradient as NativeLinearGradient } from 'expo-linear-gradient';
import { useTheme } from './context';

const darkBackgrounds = {
  white: '#19231D', '#FFFFFF': '#19231D', '#F8F9F6': '#111814',
  '#F3F6F3': '#202B24', '#F4F7F4': '#1C2721', '#FAFBF9': '#18221C',
  '#EFF2F0': '#202B24', '#E8F0EA': '#202F27', '#E5F0EB': '#203128',
  '#EAF4EF': '#203128', '#EAF3ED': '#203128', '#E2EFE8': '#203128',
  '#EDEFEA': '#28342D', '#F2F5F2': '#202B24', '#E9F4EE': '#20362B',
  '#FCECE8': '#3B2724', '#F5EADF': '#352C24', '#E9E9F7': '#292A3B',
  '#EAF0F3': '#263138', '#FCECE8': '#3B2724',
  '#EDF0ED': '#2B3730', '#E7ECE7': '#2B3730', '#E6EBE7': '#2B3730',
  '#F0F2F0': '#28342D', '#EEF1EE': '#28342D', '#ECEFEC': '#2B3730',
  '#E9EDE8': '#28342D', '#FBF2E3': '#3A3223',
};
const darkText = {
  '#17221D': '#F0F5F1', '#253129': '#E8EFEA', '#26332C': '#E8EFEA',
  '#223028': '#E8EFEA', '#344239': '#D7E1DA', '#35443B': '#D7E1DA',
  '#415046': '#D0DBD3', '#425047': '#D0DBD3', '#526057': '#B8C5BC',
  '#536057': '#B8C5BC', '#647068': '#B4C0B7', '#68756C': '#B4C0B7',
  '#6F7B73': '#B4C0B7', '#718078': '#AAB8AE', '#738078': '#AAB8AE',
  '#78857C': '#AAB8AE', '#818C84': '#AAB8AE', '#829087': '#AAB8AE',
  '#87928A': '#AAB8AE', '#89948C': '#AAB8AE', '#8A948D': '#AAB8AE',
  '#909B93': '#AAB8AE', '#929C95': '#AAB8AE', '#A0A9A3': '#8E9B92',
  '#A3ACA6': '#8E9B92', '#A5AEA8': '#8E9B92', '#A6AEA8': '#8E9B92',
  '#9BA49E': '#8E9B92', '#647068': '#B4C0B7', '#A1ACA4': '#8E9B92',
  '#A9B4AC': '#8E9B92', '#187B62': '#43BA91',
};
const darkBorders = { '#EDF0ED': '#2B3730', '#E7ECE7': '#2B3730', '#E6EBE7': '#2B3730', '#F0F2F0': '#28342D', '#ECEFEC': '#2B3730', '#EEF1EE': '#2B3730' };

function themedStyle(style, mode) {
  if (mode !== 'dark' || !style) return style;
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  if (typeof flat !== 'object' || typeof flat === 'function') return style;
  const next = { ...flat };
  if (typeof next.backgroundColor === 'string') next.backgroundColor = darkBackgrounds[next.backgroundColor] || next.backgroundColor;
  if (typeof next.color === 'string') next.color = darkText[next.color] || next.color;
  if (typeof next.borderColor === 'string') next.borderColor = darkBorders[next.borderColor] || next.borderColor;
  if (typeof next.borderTopColor === 'string') next.borderTopColor = darkBorders[next.borderTopColor] || next.borderTopColor;
  if (typeof next.borderBottomColor === 'string') next.borderBottomColor = darkBorders[next.borderBottomColor] || next.borderBottomColor;
  return next;
}

export function View({ style, ...props }) { const { mode } = useTheme(); return <NativeView {...props} style={themedStyle(style, mode)} />; }
export function Text({ style, ...props }) { const { mode } = useTheme(); return <NativeText {...props} style={themedStyle(style, mode)} />; }
export function Pressable({ style, ...props }) { const { mode } = useTheme(); const mapped = typeof style === 'function' ? (state) => themedStyle(style(state), mode) : themedStyle(style, mode); return <NativePressable {...props} style={mapped} />; }
export function ScrollView({ style, contentContainerStyle, ...props }) { const { mode } = useTheme(); return <NativeScrollView {...props} style={themedStyle(style, mode)} contentContainerStyle={themedStyle(contentContainerStyle, mode)} />; }
export function SafeAreaView({ style, ...props }) { const { mode } = useTheme(); return <NativeSafeAreaView {...props} style={themedStyle(style, mode)} />; }
export function TextInput({ style, placeholderTextColor, ...props }) { const { mode } = useTheme(); return <NativeTextInput {...props} style={themedStyle(style, mode)} placeholderTextColor={mode === 'dark' ? darkText[placeholderTextColor] || placeholderTextColor : placeholderTextColor} />; }
export function StatusBar(props) { const { mode } = useTheme(); return <NativeStatusBar {...props} barStyle={mode === 'dark' ? 'light-content' : props.barStyle || 'dark-content'} />; }
export function ActivityIndicator({ color, ...props }) { const { mode } = useTheme(); return <NativeActivityIndicator {...props} color={mode === 'dark' ? darkText[color] || color : color} />; }
export function LinearGradient({ style, ...props }) { const { mode } = useTheme(); return <NativeLinearGradient {...props} style={themedStyle(style, mode)} />; }

export const Alert = {
  alert(title, message, buttons) {
    if (Platform.OS === 'web') {
      const text = [title, message].filter(Boolean).join('\n\n');
      if (!buttons || buttons.length === 0) {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(text);
        }
        return;
      }
      if (buttons.length === 1) {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(text);
        }
        if (typeof buttons[0]?.onPress === 'function') {
          buttons[0].onPress();
        }
        return;
      }
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm(text);
        if (confirmed) {
          const okBtn = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];
          if (typeof okBtn?.onPress === 'function') {
            okBtn.onPress();
          }
        } else {
          const cancelBtn = buttons.find((b) => b.style === 'cancel');
          if (typeof cancelBtn?.onPress === 'function') {
            cancelBtn.onPress();
          }
        }
      }
    } else {
      NativeAlert.alert(title, message, buttons);
    }
  },
};

export { KeyboardAvoidingView, Modal, Platform };
