import {extractDomain} from '../extract-domain';
import {LOCAL_FILE_STR} from '../../../const/string';

describe('extractDomain', () => {
  // Extract domain name
  it('should extract domain name', () => {
    expect(extractDomain('https://GOOGLE.com/qfewf?few=123')).toEqual('google.com');
    expect(extractDomain('https://127.0.0.1:8080/qfewf?few=123')).toEqual('127.0.0.1');
    expect(extractDomain('https://TRANSLATE.google.com/qfewf?few=123')).toEqual(
      'translate.google.com'
    );
    expect(extractDomain('https://localhost:9999/qfewf?few=123')).toEqual('localhost');
    expect(extractDomain('file://C:/Temp/myfile.dat')).toEqual(LOCAL_FILE_STR);
  });

  // Strip www and convert to lowercase
  it('should strip www from the domain and convert to lowercase', () => {
    expect(extractDomain('https://WWW.google.com')).toEqual('google.com');
    expect(extractDomain('http://WWW.google.com')).toEqual('google.com');
    expect(extractDomain('https://WWW.translate.GOOGLE.com')).toEqual('translate.google.com');
  });

  // Invalid URLs
  it('should return null for invalid URLs', () => {
    expect(extractDomain('randomstring')).toBeNull();
    expect(extractDomain('http:://google.com')).toBeNull();
  });

  // URLs with special characters
  it('should handle URLs with special characters', () => {
    expect(extractDomain('https://GÖOGLE.com')).toEqual('xn--gogle-jua.com');
    expect(extractDomain('https://EXÄMPLE.com:8080')).toEqual('xn--exmple-cua.com');
  });

  // Other protocols
  it('should handle other protocols', () => {
    expect(extractDomain('ftp://FILES.example.com')).toEqual('files.example.com');
  });

  // Empty or null input
  it('should return null for empty or null input', () => {
    expect(extractDomain('')).toBeNull();
  });
});
