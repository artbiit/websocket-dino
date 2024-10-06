export const setLocalStorage = (name, value) => {
  localStorage.setItem(name, JSON.stringify(value));
};

export const getLocalStorage = (name) => {
  const storedData = localStorage.getItem(name);
  if (storedData) {
    return JSON.parse(storedData);
  }
  return null;
};

// 로컬 스토리지 값 삭제
export const deleteLocalStorage = (name) => {
  localStorage.removeItem(name);
};
