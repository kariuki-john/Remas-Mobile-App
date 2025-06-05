
import { encode as b64Encode, decode as b64Decode } from 'base-64';

function reverseByteArray(arr) {
  return arr.split('').reverse().join('');
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
  }
  return result;
}

export function encode(str) {
  const reversed = reverseByteArray(str); 
  const base64 = b64Encode(reversed); 
  const withRandom = generateRandomString(5) + base64 + generateRandomString(5);
  return b64Encode(withRandom);
}

export function decode(encodedStr) {
  const decodedOnce = b64Decode(encodedStr); 
  const trimmed = decodedOnce.substring(5, decodedOnce.length - 5);
  const reversedBack = b64Decode(trimmed); 
  return reverseByteArray(reversedBack); 
}
