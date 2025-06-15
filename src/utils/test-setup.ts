// Mock localStorage with actual storage functionality
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: jest.fn((index: number) => Object.keys(store)[index]),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
}); 